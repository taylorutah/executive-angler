// Bare shell for App Store mockup captures — strips the site chrome so a
// headless browser can snap a pixel-exact phone screenshot against a neutral
// background.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mockup Stage",
  robots: { index: false, follow: false },
};

export default function MockupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "#0D1117",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
}
