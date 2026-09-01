"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";

const SUBJECT_OPTIONS = [
  "General inquiry",
  "Content correction",
  "Lodge or guide listing",
  "Partnership",
  "Advertising",
  "Technical issue",
] as const;

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
    const website = (formData.get("website") as string) ?? "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website }),
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
      <div className="desk-sheet bg-[var(--paper)] py-14 sm:py-24">
        <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
          <p className="ea-overline">Company</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--text-1)] sm:text-5xl">
            Contact
          </h1>
          <p className="mt-4 text-lg text-[var(--text-2)]">
            Have a question, suggestion, or want to partner with {SITE_NAME}?
            We&apos;d love to hear from you.
          </p>

          {submitted ? (
            <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">
                Message sent
              </h2>
              <p className="mt-2 text-[var(--text-2)]">
                We&apos;ll get back to you as soon as we can.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative mt-10 space-y-6">
              <div>
                <label htmlFor="name" className="ea-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  maxLength={120}
                  className="ea-input"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="ea-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  maxLength={254}
                  className="ea-input"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="ea-label">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue={initialSubject}
                  className="ea-input"
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
                <label htmlFor="message" className="ea-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  maxLength={8000}
                  className="ea-input resize-y"
                  placeholder="How can we help?"
                />
              </div>

              <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--danger)]">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={sending}
                  className="ea-btn ea-btn-primary ea-btn-lg"
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
