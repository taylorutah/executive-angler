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
        position: "fixed",
        inset: 0,
        margin: 0,
        padding: 0,
        backgroundColor: "#0D1117",
        overflow: "auto",
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
}
