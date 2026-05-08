"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
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
      <div className="pt-8 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-[#E8923A] mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-[#A8B2BD] mb-10">
            Have a question, suggestion, or want to partner with {SITE_NAME}?
            We&apos;d love to hear from you.
          </p>

          {submitted ? (
            <div className="rounded-xl bg-[#E8923A]/5 border border-forest/20 p-8 text-center">
              <CheckCircle className="h-12 w-12 text-[#E8923A] mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-2">
                Message Sent
              </h2>
              <p className="text-[#A8B2BD]">
                Thank you for reaching out. We&apos;ll get back to you as soon
                as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#F0F6FC] mb-1.5"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-[#21262D] px-4 py-3 text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:ring-2 focus:ring-[#E8923A]/20 outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#F0F6FC] mb-1.5"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-[#21262D] px-4 py-3 text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:ring-2 focus:ring-[#E8923A]/20 outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-[#F0F6FC] mb-1.5"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue={initialSubject}
                  className="w-full rounded-lg border border-[#21262D] px-4 py-3 text-[#F0F6FC] focus:border-[#E8923A] focus:ring-2 focus:ring-[#E8923A]/20 outline-none transition-colors"
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
                  className="block text-sm font-medium text-[#F0F6FC] mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full rounded-lg border border-[#21262D] px-4 py-3 text-[#F0F6FC] placeholder:text-[#6E7681] focus:border-[#E8923A] focus:ring-2 focus:ring-[#E8923A]/20 outline-none transition-colors resize-y"
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
                <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={sending || !captchaResolved}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E8923A] px-6 py-3 text-base font-medium text-white hover:bg-[#E8923A]-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
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
