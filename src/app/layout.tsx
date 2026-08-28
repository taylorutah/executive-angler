import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import SkipLink, { MAIN_CONTENT_ID } from "@/components/layout/nav/SkipLink";
import CommandPalette from "@/components/CommandPalette";
import RegisterBinder from "@/components/system/RegisterBinder";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { organizationJsonLd } from "@/lib/seo";
import { REGISTER_BOOTSTRAP } from "@/lib/register";
import "./globals.css";

/* Two faces only (DESIGN.md): Fraunces 500/600 for display, Inter 400/500/600 for UI.
   Pinned weights only — a stray 700 anywhere resolves to 600, which self-enforces the law. */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const GA_MEASUREMENT_ID = "G-RY19PKC2WQ";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium Fly Fishing Resource`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium Fly Fishing Resource`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/madison-river-three-dollar-bridge.jpg",
        width: 1920,
        height: 736,
        alt: "The Madison River in Montana — Executive Angler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Premium Fly Fishing Resource`,
    description: SITE_DESCRIPTION,
    images: ["/images/madison-river-three-dollar-bridge.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "mVDklKxzTE-3CSW-4xSd_CCqwEPcrnVh6zTeWeJF3GA",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo-1200.png`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-register="daylight"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: REGISTER_BOOTSTRAP }} />
        <meta name="apple-itunes-app" content="app-id=6760311036" />
        <link rel="preconnect" href="https://qlasxtfbodyxbcuchvxz.supabase.co" />
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="page-ground antialiased min-h-screen flex flex-col text-[var(--text-primary)]">
        <SkipLink />
        <AuthProvider>
          <ThemeProvider>
            <RegisterBinder />
            <Header />
            <main
              id={MAIN_CONTENT_ID}
              tabIndex={-1}
              className="flex-1 pt-[56px] pb-14 lg:pb-0"
            >
              {children}
            </main>
            <Footer />
            <MobileTabBar />
            <CommandPalette />
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
