"use client";

import { useThemeContext } from "@/shared/providers/theme";

export function useTheme() {
  return useThemeContext();
}
