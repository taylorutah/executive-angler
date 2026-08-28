"use client";

import { useState } from "react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { Button } from "@/components/ui/Button";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Content Correction",
  "Lodge or Guide Listing",
  "Partnership",
  "Advertising",
  "Technical Issue",
] as const;

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

const fieldClass =
  "w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 font-ui text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none focus:border-[var(--action)]";

interface Props {
  initialSubject: string;
}

export default function ContactForm({ initialSubject }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResolved, setCaptchaResolved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, token: captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Failed to send message. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-[var(--border-rule)] bg-[var(--surface-raised)] p-8">
        <h2 className="mb-2 font-heading text-2xl font-semibold text-[var(--text-primary)]">
          Message sent
        </h2>
        <p className="font-ui text-[15px] text-[var(--text-body)]">
          Thank you for reaching out. We&apos;ll get back to you as soon
          as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="mb-1.5 block font-ui text-sm text-[var(--text-primary)]">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className={fieldClass}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block font-ui text-sm text-[var(--text-primary)]">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={fieldClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block font-ui text-sm text-[var(--text-primary)]">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          required
          defaultValue={initialSubject}
          className={fieldClass}
        >
          <option value="">Select a topic</option>
          {SUBJECT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block font-ui text-sm text-[var(--text-primary)]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className={`${fieldClass} resize-y`}
          placeholder="How can we help?"
        />
      </div>

      <TurnstileWidget
        siteKey={TURNSTILE_SITE_KEY}
        onToken={(t) => {
          setCaptchaToken(t);
          setCaptchaResolved(t !== "" || captchaResolved);
        }}
        onAvailabilityChange={setCaptchaResolved}
      />

      {error && (
        <div className="rounded-[2px] border border-[var(--border-rule)] px-4 py-3">
          <p className="font-ui text-sm text-[var(--text-primary)]">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={sending}
        variant="solid"
        size="lg"
        fullWidth
        loading={sending}
      >
        {sending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

export { SUBJECT_OPTIONS };
