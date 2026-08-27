"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Pro Refund Request",
  "Guide Pro Claim",
  "Content Correction",
  "Lodge or Guide Listing",
  "Partnership",
  "Advertising",
  "Technical Issue",
] as const;

const TURNSTILE_SITE_KEY = "0x4AAAAAAACzmkL0lBFlfTsxp";

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageInner />
    </Suspense>
  );
}

function ContactPageInner() {
  const searchParams = useSearchParams();
  const requestedSubject = searchParams.get("subject") ?? "";
  const initialSubject = SUBJECT_OPTIONS.find(
    (s) => s.toLowerCase() === requestedSubject.toLowerCase()
  ) ?? "";

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

  return (
    <>
      <div className="bg-[var(--surface-page)] pb-20 pt-14">
        <div className="mx-auto max-w-2xl px-5 sm:px-8 xl:px-20">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[1.6px] text-[var(--text-meta)]">
            House
          </p>
          <h1
            className="mb-4 mt-4 font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)] sm:text-[48px] sm:leading-[56px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            Contact
          </h1>
          <p className="prose mb-10 text-[16px] leading-6 text-[var(--text-body)] sm:text-[18px] sm:leading-7">
            Have a question, suggestion, or want to partner with {SITE_NAME}?
            We&apos;d love to hear from you.
          </p>

          {submitted ? (
            <div className="rounded-[4px] border border-[var(--border-rule)] bg-[var(--surface-raised)] p-8">
              <h2 className="mb-2 font-heading text-2xl font-semibold text-[var(--text-primary)]">
                Message sent
              </h2>
              <p className="text-[var(--text-body)]">
                Thank you for reaching out. We&apos;ll get back to you as soon
                as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[var(--action)]/20"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[var(--action)]/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue={initialSubject}
                  className="w-full rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[var(--action)]/20"
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
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full resize-y rounded-[2px] border border-[var(--border-rule)] bg-[var(--surface-card)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-meta)] outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[var(--action)]/20"
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

              {/* Error message */}
              {error && (
                <div className="rounded-[2px] border border-[var(--border-rule)] px-4 py-3">
                  <p className="font-ui text-sm text-[var(--text-primary)]">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={sending || !captchaResolved}
                  className="inline-flex items-center rounded-[2px] bg-[var(--action)] px-6 py-3 font-ui text-[14px] font-medium text-[var(--on-action)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
