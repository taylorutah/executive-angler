import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE_NAME} — the rules governing use of our website.`,
};

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-forest-dark mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Last updated: March 1, 2026
        </p>

        <div className="prose prose-lg max-w-none text-slate-700 space-y-6">
          <p>
            Welcome to {SITE_NAME}. By accessing or using our website at{" "}
            <a href={SITE_URL} className="text-forest hover:text-forest-light">
              {SITE_URL}
            </a>
            , you agree to be bound by these Terms of Service. If you do not agree,
            please do not use the site.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            1. Use of the Website
          </h2>
          <p>
            {SITE_NAME} provides fly fishing information, including destination
            guides, river profiles, species reference material, lodge and guide
            listings, and editorial articles. This content is provided for
            informational purposes only. You may browse, search, and use our content
            for personal, non-commercial purposes.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            2. User Accounts
          </h2>
          <p>
            You may create an account to access features like saving favorites and
            submitting photos. You are responsible for maintaining the security of
            your account credentials and for all activity that occurs under your
            account. You must provide accurate information when creating your account
            and keep it up to date.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            5. Third-Party Links
          </h2>
          <p>
            Our site contains links to third-party websites, including lodge
            websites, guide services, fly shops, and external resources. We are not
            responsible for the content, privacy practices, or availability of these
            external sites. Linking to a third party does not imply endorsement.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            9. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate your account and access to
            the site at any time, for any reason, including violation of these Terms.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            10. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the site
            after changes are posted constitutes acceptance of the revised Terms. We
            encourage you to review this page periodically.
          </p>

          <h2 className="font-heading text-2xl font-bold text-forest-dark mt-10">
            11. Contact
          </h2>
          <p>
            If you have questions about these Terms of Service, please reach out
            through our{" "}
            <a href="/contact" className="text-forest hover:text-forest-light">
              contact form
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
