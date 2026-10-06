import { z } from "zod";

export const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string(),

  // Leave unset to send no events, e.g. in local development.
  EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,

  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
});
