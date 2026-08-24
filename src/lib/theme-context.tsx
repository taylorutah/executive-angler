"use client";

import { createContext, useContext } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

/**
 * Preference toggle is gone (Lane A). Register is route-determined.
 * Context remains so Header.tsx (Lane E) can keep compiling until it
 * removes the ThemeToggle import. toggle() is a no-op.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: "light", toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
