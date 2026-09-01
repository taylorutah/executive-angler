import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE_NAME} — the rules governing use of our website.`,
};

export default function TermsPage() {
  return (
    <div className="py-14 sm:py-16">
      <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
        <p className="ea-overline">Company</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--text-1)]">
          Terms of Service
        </h1>
        <p className="mt-3 text-[var(--text-14)] text-[var(--text-3)]">
          Last updated: May 25, 2026
        </p>

        <div className="prose mt-8 max-w-none space-y-6 text-[var(--text-2)]">
          <p>
            Welcome to {SITE_NAME}. By accessing or using our website at{" "}
            <a href={SITE_URL} className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
              {SITE_URL}
            </a>
            , you agree to be bound by these Terms of Service. If you do not agree,
            please do not use the site.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            1. Use of the Website
          </h2>
          <p>
            {SITE_NAME} provides fly fishing information, including destination
            guides, river profiles, species reference material, lodge and guide
            listings, and editorial articles. This content is provided for
            informational purposes only. You may browse, search, and use our content
            for personal, non-commercial purposes.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            2. User Accounts
          </h2>
          <p>
            You may create an account to access features like saving favorites and
            submitting photos. You are responsible for maintaining the security of
            your account credentials and for all activity that occurs under your
            account. You must provide accurate information when creating your account
            and keep it up to date.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            3. Photo Submissions
          </h2>
          <p>
            By submitting a photo to {SITE_NAME}, you grant us a non-exclusive,
            worldwide, royalty-free license to display, reproduce, and distribute
            your photo on our website in connection with the content it was submitted
            to. You represent that you own the rights to any photo you submit and
            that the photo does not violate the rights of any third party. We reserve
            the right to reject or remove any photo submission at our discretion.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            4. Content Accuracy
          </h2>
          <p>
            We strive to provide accurate and up-to-date information about fishing
            destinations, regulations, lodges, guides, and species. However, fishing
            conditions, regulations, pricing, and availability change frequently. We
            make no guarantees about the accuracy, completeness, or timeliness of any
            content on this site. Always verify current regulations with local fish
            and wildlife agencies before fishing, and confirm pricing and
            availability directly with lodges and guides.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            4a. Free Access
          </h2>
          <p>
            {SITE_NAME} is free to use. Every feature of the app &mdash; journal,
            fly workbench, river conditions, personal insights, scorecards, exports,
            and everything else &mdash; is available to all users at no cost. There
            is no paid tier, no subscription, and no payment is ever required to use
            the app.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            5. Third-Party Links
          </h2>
          <p>
            Our site contains links to third-party websites, including lodge
            websites, guide services, fly shops, and external resources. We are not
            responsible for the content, privacy practices, or availability of these
            external sites. Linking to a third party does not imply endorsement.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            6. Intellectual Property
          </h2>
          <p>
            All original content on {SITE_NAME}, including text, graphics, logos,
            and software, is the property of {SITE_NAME} and is protected by
            copyright and other intellectual property laws. You may not reproduce,
            distribute, or create derivative works from our content without prior
            written permission, except for personal, non-commercial use such as
            trip planning.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            7. Prohibited Conduct
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Use the site for any unlawful purpose or in violation of any applicable
              laws or regulations
            </li>
            <li>
              Scrape, crawl, or use automated tools to extract content in bulk
              without permission
            </li>
            <li>
              Submit false, misleading, or offensive content through photo
              submissions, reviews, or the contact form
            </li>
            <li>
              Attempt to gain unauthorized access to other user accounts or our
              systems
            </li>
            <li>
              Interfere with the proper functioning of the website
            </li>
          </ul>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            8. Limitation of Liability
          </h2>
          <p>
            {SITE_NAME} is provided &quot;as is&quot; without warranties of any
            kind, either express or implied. We are not liable for any damages
            arising from your use of the site, including but not limited to direct,
            indirect, incidental, or consequential damages. Fly fishing involves
            inherent risks. Information on this site should not be considered a
            substitute for local knowledge, professional guidance, or personal
            judgment regarding safety on the water.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            9. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate your account and access to
            the site at any time, for any reason, including violation of these Terms.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            10. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the site
            after changes are posted constitutes acceptance of the revised Terms. We
            encourage you to review this page periodically.
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold text-[var(--text-1)]">
            11. Contact
          </h2>
          <p>
            If you have questions about these Terms of Service, please reach out
            through our{" "}
            <a href="/contact" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
              contact form
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
