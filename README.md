# template

pnpm monorepo starting point: Expo mobile app, TanStack Start web app, Fastify +
tRPC API, shared types.

```
apps/mobile     Expo Router app — email OTP auth, push notifications
apps/web        TanStack Start (Vite) app — shadcn/Tailwind v4
packages/api    Fastify + tRPC + better-auth + Drizzle (Postgres)
packages/shared Types/schemas shared between the API and the clients
docker/         Local Postgres, pgAdmin and Mailpit
```

## What's wired up

- **Auth** — better-auth with email OTP. The API mails codes through SMTP
  (Mailpit locally); the mobile app has sign-in + verify screens, and everything
  under `app/(protected)` requires a session.
- **API** — tRPC router mounted at `/trpc`, `protectedProcedure` for
  session-guarded calls, better-auth routes at `/api/auth/*`.
- **Push notifications** — `notify()` writes a notification row and queues a
  delivery on pg-boss, which sends it via Expo. The mobile app registers its
  push token on launch.
- **Onboarding** — a first-launch flow under `app/onboarding` (a
  notifications step) that runs before sign-in. Add steps with
  `OnboardingStep` and bump its `STEP_COUNT`.
- **Account deletion** — `account.delete` removes the user's uploads and
  account; the home screen and the web `/delete-account` page expose it, as
  the app stores require.
- **File uploads** — `files.createUpload` / `files.confirmUpload` hand out
  presigned S3 URLs so clients upload straight to the bucket.
- **Crash reporting** — the mobile app sends errors to Sentry when
  `EXPO_PUBLIC_SENTRY_DSN` is set, and release builds upload source maps.
- **Store listings** — fastlane uploads the App Store and Play Store text and
  screenshots from `apps/mobile/fastlane`; see [Store listing](#store-listing).

## Local setup

1. `pnpm install`
2. Copy the env examples and fill them in:
   - `cp docker/.env.example docker/.env`
   - `cp packages/api/.env.example packages/api/.env` — generate
     `BETTER_AUTH_SECRET` with `openssl rand -base64 32`
   - `cp apps/mobile/.env.example apps/mobile/.env`
3. `pnpm start` — Postgres (5432), pgAdmin (15433), Mailpit (8025)
4. Create the first migration, then apply it:
   `pnpm --filter @template/api exec drizzle-kit generate` and
   `pnpm --filter @template/api exec drizzle-kit migrate`
5. `pnpm dev` — starts docker, API, mobile and web in a detached `template`
   tmux session; `pnpm down` stops everything (`pnpm down -- --purge` also
   wipes the database volumes)

Sign-in codes land in Mailpit at http://localhost:8025.

## Per-project setup checklist

Things that can't be inherited from the template — do these once per project:

- [ ] **Expo/EAS**: run `eas init` in `apps/mobile` to create the project and
      fill in `extra.eas.projectId` (push tokens and EAS builds need it). Check
      `owner`, `name`, `slug`, `scheme` and the bundle/package IDs in
      `app.config.ts`.
- [ ] **Android push**: add `google-services.json` to `apps/mobile` and
      re-enable `android.googleServicesFile` in `app.config.ts`.
- [ ] **Android release signing**: set `TEMPLATE_UPLOAD_STORE_FILE`,
      `TEMPLATE_UPLOAD_STORE_PASSWORD`, `TEMPLATE_UPLOAD_KEY_ALIAS` and
      `TEMPLATE_UPLOAD_KEY_PASSWORD` in `~/.gradle/gradle.properties` (or as
      `ORG_GRADLE_PROJECT_*` env vars) for local release builds; see
      `apps/mobile/plugins/withReleaseSigning.ts`.
- [ ] **Store review account**: set `REVIEW_EMAIL` and `REVIEW_OTP` on the
      API so reviewers can sign in without an inbox.
- [ ] **Sentry**: create a React Native project, set `EXPO_PUBLIC_SENTRY_DSN`,
      and set `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` in the EAS
      environment (and in `apps/mobile/.env` for local release builds).
- [ ] **Store listing**: replace the placeholder text in
      `apps/mobile/fastlane/metadata`, set the GitHub secrets in
      [Store listing](#store-listing), and adapt `.maestro/screenshots.yaml` to
      the screens you want in the listing.
- [ ] **Web site info**: fill in `apps/web/src/lib/site.ts`, replace the
      `example.com` URLs in `apps/web/public/robots.txt` and `sitemap.xml`,
      and write the privacy and terms pages (they ship as TODO outlines).
- [ ] **Icons**: replace the images in `packages/shared/assets/images` (app
      icon, splash, adaptive icons, favicon, and `icon-email.png` used in the
      OTP email), and regenerate `logo192.png`, `logo512.png` and
      `apple-touch-icon.png` in `apps/web/public` from the new icon.
- [ ] **Fly.io**: `app` in `packages/api/fly.toml` must be an app that exists
      (`fly apps create <name>`), then set the `FLY_API_TOKEN` and
      `DATABASE_URL` GitHub secrets.
- [ ] **Vercel**: set the project's Root Directory to `apps/web` (the deploy
      uploads the whole repo so the pnpm workspace resolves), then set
      `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` GitHub secrets for
      the web deploy, and `EXPO_TOKEN` for mobile OTA.
- [ ] **S3**: create a bucket and fill in the `BUCKET_*` env vars, or delete
      `packages/api/src/lib/s3.ts` and the `files` router if you don't need
      uploads.

## Store listing

The App Store and Play Store listing text and screenshots live in
`apps/mobile/fastlane`, and fastlane uploads them. Builds and release notes
still go through EAS.

- `fastlane/metadata/ios` is in
  [deliver](https://docs.fastlane.tools/actions/deliver/) format. The ios lane
  needs a version in "Prepare for Submission" on App Store Connect.
- `fastlane/metadata/android` is in
  [supply](https://docs.fastlane.tools/actions/supply/) format. The title and
  full description are symlinks to the iOS name and description. The android
  lane attaches the listing to the newest release on the internal track, so
  submit one build there first.

### Screenshots

Add PNG or JPEG files, in display order (e.g. `01-home.png`):

- **iOS:** `fastlane/screenshots/ios/en-US`. deliver reads the device from the
  image size. The App Store needs a 6.9" iPhone set: 1320×2868 or 1290×2796.
- **Android:** `fastlane/metadata/android/en-US/images/phoneScreenshots`, 2 to
  8 images, 320 to 3840 px per side.

An upload replaces the store's screenshots only for the languages (iOS) or
screenshot types (Android) that have files here, so an empty folder leaves the
store as it is.

The screenshots lanes build a release version of the app and run the
[Maestro](https://maestro.dev) flow in `.maestro/screenshots.yaml`, which signs
in as the store review account. You need Maestro and a `.env.production` like
the one used for release builds, with the review account's `REVIEW_EMAIL` and
`REVIEW_OTP` for the API in that file. Then, from `apps/mobile`:

```bash
# Boots an "iPhone 17 Pro Max" simulator.
# Use another of the same size with iphone:"…"
bundle exec fastlane ios screenshots --env production
# Uses the one running Android emulator
bundle exec fastlane android screenshots --env production
```

Each lane replaces the images in its screenshots folder. Review and commit
them, then upload them with the metadata lanes.

### Uploading

Run the **Store Metadata** GitHub workflow, or locally from `apps/mobile`:

```bash
bundle install
bundle exec fastlane ios metadata
bundle exec fastlane android metadata
```

The lanes read these env vars (GitHub secrets in the workflow):

| Variable                                                         | Lane         | Value                                                                     |
| ---------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `APP_STORE_CONNECT_API_KEY_KEY_ID`                               | ios          | Key ID of an App Store Connect API key with the App Manager role          |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID`                            | ios          | Issuer ID shown above the API keys list                                   |
| `APP_STORE_CONNECT_API_KEY_KEY`                                  | ios          | Contents of the key's `.p8` file                                          |
| `REVIEW_EMAIL`, `REVIEW_OTP`                                     | ios          | The store review account, as set on the API                               |
| `REVIEW_CONTACT_FIRST_NAME`, `…_LAST_NAME`, `…_EMAIL`, `…_PHONE` | ios metadata | The App Review contact. The phone starts with `+` and the country code    |
| `SUPPLY_JSON_KEY_DATA`                                           | android      | JSON key of a Google Cloud service account with access to the app in Play |

The workflow reads the Play key from the `GOOGLE_PLAY_JSON_KEY` secret.

## Notes

- Postgres runs the stock `postgres:16` image. Need PostGIS or another
  extension? Point the `database` service at a custom image and add a
  `CREATE EXTENSION` line to `docker/postgres/init.sql`.
- `packages/shared/src/notify.ts` defines the notification payload union — add a
  variant per notification type your app sends, then handle it in
  `renderNotification` in `packages/api/src/lib/notify.ts`.
- Social sign-in (Google/Apple) isn't included. better-auth's `socialProviders`
  is the place to add it back.

## Scripts

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm check` (prettier) — all run
across every workspace.
