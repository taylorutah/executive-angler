"use client";

import { useState } from "react";
import Script from "next/script";
import { SITE_NAME } from "@/lib/constants";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function ContactPage() {
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

    try {
      // Get reCAPTCHA v3 token (invisible — no user interaction required)
      let token: string | undefined;
      if (RECAPTCHA_SITE_KEY && typeof window !== "undefined" && window.grecaptcha) {
        token = await new Promise<string>((resolve) => {
          window.grecaptcha.ready(() => {
            window.grecaptcha
              .execute(RECAPTCHA_SITE_KEY, { action: "contact" })
              .then(resolve);
          });
        });
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, token }),
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
      {/* Load reCAPTCHA v3 script — invisible, no checkbox */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="lazyOnload"
        />
      )}

      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-forest-dark mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-slate-600 mb-10">
            Have a question, suggestion, or want to partner with {SITE_NAME}?
            We&apos;d love to hear from you.
          </p>

          {submitted ? (
            <div className="rounded-xl bg-forest/5 border border-forest/20 p-8 text-center">
              <CheckCircle className="h-12 w-12 text-forest mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-forest-dark mb-2">
                Message Sent
              </h2>
              <p className="text-slate-600">
                Thank you for reaching out. We&apos;ll get back to you as soon
                as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition-colors"
                >
                  <option value="">Select a topic</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Content Correction">Content Correction</option>
                  <option value="Lodge or Guide Listing">
                    Lodge or Guide Listing
                  </option>
                  <option value="Partnership">Partnership</option>
                  <option value="Advertising">Advertising</option>
                  <option value="Technical Issue">Technical Issue</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition-colors resize-y"
                  placeholder="How can we help?"
                />
              </div>

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
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3 text-base font-medium text-white hover:bg-forest-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending..." : "Send Message"}
                </button>

                {/* reCAPTCHA attribution (required by Google TOS when badge is hidden) */}
                {RECAPTCHA_SITE_KEY && (
                  <p className="text-xs text-slate-400 max-w-[200px] text-right leading-relaxed">
                    Protected by{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-600"
                    >
                      reCAPTCHA
                    </a>
                    {" · "}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-600"
                    >
                      Terms
                    </a>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
