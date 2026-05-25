import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE_NAME} — the rules governing use of our website.`,
};

export default function TermsPage() {
  return (
    <div className="pt-8 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-[#E8923A] mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-[#A8B2BD] mb-10">
          Last updated: May 25, 2026
        </p>

        <div className="prose prose-lg max-w-none text-[#F0F6FC] space-y-6">
          <p>
            Welcome to {SITE_NAME}. By accessing or using our website at{" "}
            <a href={SITE_URL} className="text-[#E8923A] hover:text-[#E8923A]-light">
              {SITE_URL}
            </a>
            , you agree to be bound by these Terms of Service. If you do not agree,
            please do not use the site.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            1. Use of the Website
          </h2>
          <p>
            {SITE_NAME} provides fly fishing information, including destination
            guides, river profiles, species reference material, lodge and guide
            listings, and editorial articles. This content is provided for
            informational purposes only. You may browse, search, and use our content
            for personal, non-commercial purposes.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            2. User Accounts
          </h2>
          <p>
            You may create an account to access features like saving favorites and
            submitting photos. You are responsible for maintaining the security of
            your account credentials and for all activity that occurs under your
            account. You must provide accurate information when creating your account
            and keep it up to date.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            4a. Founders&apos; Free Launch Year
          </h2>
          <p>
            From May 25, 2026 through May 25, 2027 (the &quot;Founders&apos;
            Free Launch Year&quot;), every authenticated {SITE_NAME} user has full
            access to Pro features at no cost. No payment method is required to
            activate Pro access during this window.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Pro features are unlocked for all signed-in users automatically — no
              code, coupon, or sign-up step is required.
            </li>
            <li>
              Standard Pro pricing returns on May 25, 2027 at $2.99/month or
              $19.99/year. Users without an active paid subscription on that date
              will be returned to the Free tier; existing journal data, fly box
              contents, and account settings are preserved.
            </li>
            <li>
              We will notify all users at least 30 days before the window closes
              (on or about April 25, 2027) with an in-app banner and email so
              there are no surprises.
            </li>
            <li>
              Users may pre-subscribe at any time during the window to lock in
              pricing for continued Pro access after May 25, 2027. Pre-purchasers
              are billed immediately and their subscription period runs from the
              date of purchase.
            </li>
            <li>
              The Founders&apos; Free Launch Year affects Pro feature access only.
              Free-tier access continues unchanged after the window closes.
            </li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            5. Third-Party Links
          </h2>
          <p>
            Our site contains links to third-party websites, including lodge
            websites, guide services, fly shops, and external resources. We are not
            responsible for the content, privacy practices, or availability of these
            external sites. Linking to a third party does not imply endorsement.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
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

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            9. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate your account and access to
            the site at any time, for any reason, including violation of these Terms.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            10. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the site
            after changes are posted constitutes acceptance of the revised Terms. We
            encourage you to review this page periodically.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            11. Contact
          </h2>
          <p>
            If you have questions about these Terms of Service, please reach out
            through our{" "}
            <a href="/contact" className="text-[#E8923A] hover:text-[#E8923A]-light">
              contact form
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
