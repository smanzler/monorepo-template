import { router } from "../lib/trpc";
import { accountRouter } from "./account";
import { filesRouter } from "./files";
import { notificationsRouter } from "./notifications";

export const appRouter = router({
  account: accountRouter,
  files: filesRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
