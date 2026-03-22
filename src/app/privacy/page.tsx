import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME} — how we collect, use, and protect your information.`,
};

export default function PrivacyPage() {
  return (
    <div className="pt-8 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-[#E8923A] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#A8B2BD] mb-10">
          Last updated: March 18, 2026
        </p>

        <div className="prose prose-lg max-w-none text-[#F0F6FC] space-y-6">
          <p>
            {SITE_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            operates the website at{" "}
            <a href={SITE_URL} className="text-[#E8923A] hover:text-[#E8923A]-light">
              {SITE_URL}
            </a>
            . This Privacy Policy explains how we collect, use, and protect your
            information when you use our website and iOS app.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Information We Collect
          </h2>
          <h3 className="font-heading text-xl font-semibold text-[#E8923A] mt-6">
            Account Information
          </h3>
          <p>
            When you create an account, we collect your email address and password.
            If you sign in with Google, we receive your name and email address from
            Google. You may also provide a display name, username, bio, and profile
            photo. We use this information to manage your account and provide
            personalized features.
          </p>

          <h3 className="font-heading text-xl font-semibold text-[#E8923A] mt-6">
            Fishing Session Data
          </h3>
          <p>
            When you log a fishing session in our iOS app, we collect: session date
            and duration, river name, water conditions, catches (species, size, fly
            used), gear used, and photos you choose to attach. This data is stored
            in your private journal and is only visible to you unless you explicitly
            set a session to &quot;public.&quot;
          </p>

          <h3 className="font-heading text-xl font-semibold text-[#E8923A] mt-6">
            Location Data
          </h3>
          <p>
            During active fishing sessions, the app records your GPS location to
            track your route and auto-detect the river you are fishing. Location
            data is collected only while a session is active and only with your
            explicit permission. <strong>We never share your precise GPS coordinates
            or fishing spots with other users.</strong> When a session is set to
            public, only the river name and aggregate catch data are visible — never
            your route or exact locations.
          </p>

          <h3 className="font-heading text-xl font-semibold text-[#E8923A] mt-6">
            Photo Submissions
          </h3>
          <p>
            When you submit a photo, we collect the photo file and any optional
            caption or camera settings you provide. Photos approved by our
            moderators may be displayed publicly on the site.
          </p>

          <h3 className="font-heading text-xl font-semibold text-[#E8923A] mt-6">
            Analytics
          </h3>
          <p>
            We use Vercel Analytics and Vercel Speed Insights on our website to
            understand how visitors use the site. These collect anonymous usage data.
            The iOS app collects crash logs and performance data to improve stability.
            No personally identifiable information is collected by our analytics tools.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain your account, journal, and favorites</li>
            <li>To record and display your fishing sessions and analytics</li>
            <li>To process and display community photo submissions</li>
            <li>To enable social features (follows, kudos, comments) that you opt into</li>
            <li>To improve our website, app, and content</li>
            <li>To send administrative communications about your account</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            In-App Purchases
          </h2>
          <p>
            Executive Angler Pro subscriptions are processed by Apple through the
            App Store. We do not collect or store your payment information. Apple
            handles all billing. You can manage or cancel your subscription in your
            Apple ID settings.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Data Storage and Security
          </h2>
          <p>
            Your account data is stored securely using Supabase, a hosted PostgreSQL
            database service with encryption at rest. Photo submissions are stored in
            secure cloud storage. We use industry-standard security measures to
            protect your information, including HTTPS encryption for all data in
            transit.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Third-Party Services
          </h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Supabase</strong> — Database and authentication
            </li>
            <li>
              <strong>Vercel</strong> — Website hosting and analytics
            </li>
            <li>
              <strong>Mapbox</strong> — Interactive maps on destination and river
              pages
            </li>
            <li>
              <strong>Google</strong> — OAuth sign-in and business reviews
            </li>
            <li>
              <strong>Apple</strong> — App distribution, in-app purchases, and
              crash reporting
            </li>
          </ul>
          <p>
            Each service has its own privacy policy governing how they handle data.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Cookies
          </h2>
          <p>
            We use essential cookies to manage your authentication session. We do not
            use advertising cookies or third-party tracking cookies.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for photo submissions at any time</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us through our{" "}
            <a href="/contact" className="text-[#E8923A] hover:text-[#E8923A]-light">
              contact form
            </a>
            .
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Children&apos;s Privacy
          </h2>
          <p>
            Our website is not directed at children under 13. We do not knowingly
            collect personal information from children under 13. If you believe we
            have collected information from a child under 13, please contact us
            immediately.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            registered users of significant changes via email. The &quot;Last
            updated&quot; date at the top of this page indicates when it was last
            revised.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Contact
          </h2>
          <p>
            If you have questions about this Privacy Policy, please reach out
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
