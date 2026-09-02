"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Login, house, and notebook surfaces keep a clean masthead. The ticker is gazette chrome. */
export const TICKER_HIDE = [
  /^\/login/,
  /^\/signup/,
  /^\/journal/,
  /^\/today/,
  /^\/styleguide/,
  /^\/account/,
];

export function hideSiteTicker(pathname: string): boolean {
  return TICKER_HIDE.some((re) => re.test(pathname));
}

export default function TickerGate({ ticker }: { ticker: ReactNode }) {
  const pathname = usePathname() ?? "";
  if (hideSiteTicker(pathname)) return null;
  return ticker;
}
