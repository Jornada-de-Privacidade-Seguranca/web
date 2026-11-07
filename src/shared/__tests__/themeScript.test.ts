// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from "vitest";
import { THEME_STORAGE_KEY } from "@/shared/providers/theme";

describe("ThemeScript inline logic execution", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  function runInlineScript() {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const hasMatchMedia =
        typeof window !== "undefined" && typeof window.matchMedia === "function";
      const theme =
        stored === "dark" || stored === "light" || stored === "high-contrast"
          ? stored
          : hasMatchMedia &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : hasMatchMedia
              ? "light"
              : "dark";
      document.documentElement.classList.remove(
        "dark",
        "light",
        "high-contrast"
      );
      document.documentElement.classList.add(theme);
    } catch {
      // noop
    }
  }

  it("deve aplicar 'high-contrast' quando estiver no localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "high-contrast");
    runInlineScript();
    expect(document.documentElement.classList.contains("high-contrast")).toBe(
      true
    );
  });

  it("deve fazer fallback para a preferência do sistema quando o localStorage contiver valor inválido", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "malicious-theme");

    runInlineScript();

    const hasTheme =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.classList.contains("light");
    expect(hasTheme).toBe(true);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(
      false
    );
  });
});

