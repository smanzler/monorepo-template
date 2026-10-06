import { execSync } from "node:child_process";
import type { ConfigContext, ExpoConfig } from "expo/config";
import "dotenv/config";

const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

const androidVersionCode = Number(
  execSync("git rev-list --count HEAD").toString().trim(),
);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "template",
  slug: "template",
  version: "1.0.0",
  owner: "sigh10",
  orientation: "portrait",
  icon: "../../packages/shared/assets/images/icon.png",
  scheme: "com.sigh10.template",
  userInterfaceStyle: "automatic",
  platforms: ["ios", "android"],
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.sigh10.template",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FCFCFB",
      foregroundImage:
        "../../packages/shared/assets/images/android-icon-foreground.png",
      backgroundImage:
        "../../packages/shared/assets/images/android-icon-background.png",
      monochromeImage:
        "../../packages/shared/assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    package: "com.sigh10.template",
    versionCode: androidVersionCode,
    // Android push delivery needs an FCM config: add google-services.json here
    // and re-enable this line.
    // googleServicesFile: "./google-services.json",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "../../packages/shared/assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-notifications",
    "expo-build-properties",
    "expo-font",
    "expo-web-browser",
    "expo-image",
    "expo-secure-store",
    "expo-sqlite",
    "expo-status-bar",
    "./plugins/withReleaseSigning",
    [
      "@sentry/react-native/expo",
      {
        // The plugin only checks that a key is present. Add a key only when
        // it is set, to keep the warning when a slug is missing.
        ...(sentryOrg && { organization: sentryOrg }),
        ...(sentryProject && { project: sentryProject }),
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    // Set by `eas init` — required for push tokens and EAS builds/updates.
    eas: {},
  },
});
