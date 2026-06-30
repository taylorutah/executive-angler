import {
  buildWelcome,
  buildAccountDeleted,
  type BrandedEmailContent,
} from "@/lib/email/senders";

export type EmailSample = {
  key: string;
  label: string;
  when: string;
  content: BrandedEmailContent;
};

/**
 * All transactional email fixtures with sample data.
 * Shared between /admin/email-preview and the send-test route so the
 * preview and the actual test send always render identical HTML.
 */
export const EMAIL_SAMPLES: ReadonlyArray<EmailSample> = [
  {
    key: "welcome",
    label: "Signup Welcome",
    when: "Fires on first authenticated callback (email confirm or OAuth signup).",
    content: buildWelcome({ displayName: "Taylor" }),
  },
  {
    key: "account_deleted",
    label: "Account Deletion Farewell",
    when: "Fires right before auth user is deleted.",
    content: buildAccountDeleted({ displayName: "Taylor" }),
  },
];
