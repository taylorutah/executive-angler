import { SITE_NAME } from "@/lib/constants";
import ContactForm from "./ContactForm";
import { SUBJECT_OPTIONS } from "./subjects";

interface Props {
  searchParams: Promise<{ subject?: string }>;
}

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const requested = sp.subject ?? "";
  const initialSubject =
    SUBJECT_OPTIONS.find((s) => s.toLowerCase() === requested.toLowerCase()) ?? "";

  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="desk-form">
          <p className="desk-eyebrow">House</p>
          <h1
            className="mb-4 mt-4 font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)] sm:text-[48px] sm:leading-[56px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            Contact
          </h1>
          <p className="desk-dek-ui mb-10">
            Have a question, suggestion, or want to partner with {SITE_NAME}?
            We&apos;d love to hear from you.
          </p>
          <ContactForm initialSubject={initialSubject} />
        </div>
      </div>
    </div>
  );
}
