import type { Metadata } from "next";
import Script from "next/script";
import { Inter, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import CommandPalette from "@/components/CommandPalette";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
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
        height: 1036,
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        {/* Theme bootstrap — runs synchronously before paint to prevent FOUC.
            Reads saved preference from localStorage; falls back to system
            preference (prefers-color-scheme), defaulting to light. The
            ThemeProvider hydrates from this same source after mount. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('ea-theme');var l;if(s==='light'||s==='dark'){l=s==='light';}else{l=!window.matchMedia('(prefers-color-scheme: dark)').matches;}if(l){document.documentElement.classList.add('light-mode');}}catch(e){}})();`,
          }}
        />
        {/* Apple native Smart App Banner — Safari iOS only. Auto-detects whether
            the app is installed and shows "Open" vs "View" accordingly. We
            prefer this over a custom banner because it's install-aware and
            rendered natively by iOS above the page chrome. */}
        <meta name="apple-itunes-app" content="app-id=6760311036" />
        {/* Preconnect to critical third-party origins */}
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
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-1 pt-[56px] pb-14 lg:pb-0">{children}</main>
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
