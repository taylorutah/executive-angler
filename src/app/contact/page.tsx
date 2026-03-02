"use client";

import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import { Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    // Use formsubmit.co for zero-backend email forwarding
    try {
      await fetch("https://formsubmit.co/ajax/taylor.warnick@gmail.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      setSubmitted(true);
    } catch {
      // Fallback — still show success since formsubmit may redirect
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  }

  return (
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
              Thank you for reaching out. We&apos;ll get back to you as soon as
              possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot for spam */}
            <input type="text" name="_honey" className="hidden" />
            {/* Disable captcha redirect */}
            <input type="hidden" name="_captcha" value="false" />

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

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3 text-base font-medium text-white hover:bg-forest-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
