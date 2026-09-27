import { createFileRoute } from "@tanstack/react-router";
import { DeleteAccountScreen } from "@/features/marketing/screens/delete-account-screen";
import { buildPageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/delete-account")({
  component: DeleteAccountScreen,
  head: () =>
    buildPageHead({
      title: `Delete your account — ${SITE.name}`,
      description: `How to permanently delete your ${SITE.name} account, and what data is deleted with it.`,
      path: "/delete-account",
    }),
});
