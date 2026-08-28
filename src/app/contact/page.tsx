"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { Send, CheckCircle, AlertCircle } from "@/icons";
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
      <div className="py-14 sm:py-24">
        <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
          <h1 className="font-display text-4xl font-semibold text-[var(--text-1)] sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-[var(--text-2)]">
            Have a question, suggestion, or want to partner with {SITE_NAME}?
            We&apos;d love to hear from you.
          </p>

          {submitted ? (
            <div className="ea-empty mt-10 rounded-card border border-[var(--border)] bg-[var(--surface)]">
              <CheckCircle size={24} className="text-[var(--success)]" />
              <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">
                Message Sent
              </h2>
              <p>
                Thank you for reaching out. We&apos;ll get back to you as soon
                as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div>
                <label htmlFor="name" className="ea-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
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
                  className="ea-input resize-y"
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
                <div className="flex items-start gap-3 rounded-surface border border-[var(--danger)] bg-[var(--surface)] px-4 py-3">
                  <AlertCircle size={20} className="mt-0.5 shrink-0 text-[var(--danger)]" />
                  <p className="text-sm text-[var(--danger)]">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={sending || !captchaResolved}
                  className="ea-btn ea-btn-primary ea-btn-lg"
                >
                  <Send size={16} />
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
