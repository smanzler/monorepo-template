import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ContentPage,
  ContentSection,
} from "@/features/marketing/components/content-page";
import { SITE } from "@/lib/site";

const deletionRequestHref = `mailto:${SITE.email.support}?subject=${encodeURIComponent(`Delete my ${SITE.name} account`)}`;

export function DeleteAccountScreen() {
  return (
    <ContentPage
      title="Delete your account"
      description={`How to permanently delete your ${SITE.name} account and the data that goes with it.`}
    >
      <ContentSection title="Delete it in the app">
        <ul>
          <li>
            Open {SITE.name} and sign in to the account you want to delete.
          </li>
          <li>
            Tap <strong>Delete account</strong>, then confirm.
          </li>
        </ul>
        <p>
          Your account is deleted straight away and you are signed out on that
          device.
        </p>
      </ContentSection>

      <ContentSection title="Cannot get into the app?">
        <p>
          Email <a href={deletionRequestHref}>{SITE.email.support}</a> from the
          address on your account and ask us to delete it. We confirm by reply
          once the account is gone.
        </p>
        <div className="mt-5">
          <Button render={<a href={deletionRequestHref} />} size="lg">
            Request deletion by email
          </Button>
        </div>
      </ContentSection>

      <ContentSection title="What we delete">
        <ul>
          <li>Your account: email address, name, and sign-in sessions.</li>
          <li>Files you uploaded.</li>
          <li>Your notifications and your devices&apos; push tokens.</li>
        </ul>
      </ContentSection>

      <ContentSection title="What we keep">
        <p>
          Nothing tied to your account stays in our live systems. Copies in
          database backups are removed as those backups expire. If you emailed
          us, we may keep that correspondence.
        </p>
        <p>
          See our <Link to="/privacy">Privacy Policy</Link> for more on how we
          handle your data.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
