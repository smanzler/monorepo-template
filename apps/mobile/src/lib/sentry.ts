import { env } from "@/env";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !!env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? "development" : "production",
  sendDefaultPii: false,
});
