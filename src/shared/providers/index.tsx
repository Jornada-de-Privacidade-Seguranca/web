"use client";

import { ThemeProvider } from "@/shared/providers/theme";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
