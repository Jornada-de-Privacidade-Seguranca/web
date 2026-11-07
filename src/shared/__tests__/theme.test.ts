import { describe, it, expect } from "vitest";
import {
  isValidTheme,
  parseTheme,
  generateThemeVars,
  VALID_THEMES,
} from "../theme";

describe("Theme utilities", () => {
  describe("VALID_THEMES", () => {
    it("deve conter 'dark', 'light' e 'high-contrast'", () => {
      expect(VALID_THEMES).toEqual(["dark", "light", "high-contrast"]);
    });
  });

  describe("isValidTheme", () => {
    it("deve retornar true apenas para temas válidos", () => {
      expect(isValidTheme("dark")).toBe(true);
      expect(isValidTheme("light")).toBe(true);
      expect(isValidTheme("high-contrast")).toBe(true);
    });

    it("deve retornar false para valores inválidos, nulos ou indefinidos", () => {
      expect(isValidTheme("blue")).toBe(false);
      expect(isValidTheme("")).toBe(false);
      expect(isValidTheme(null)).toBe(false);
      expect(isValidTheme(undefined)).toBe(false);
      expect(isValidTheme(123)).toBe(false);
      expect(isValidTheme({})).toBe(false);
    });
  });

  describe("parseTheme", () => {
    it("deve retornar o próprio tema quando for válido", () => {
      expect(parseTheme("dark")).toBe("dark");
      expect(parseTheme("light")).toBe("light");
      expect(parseTheme("high-contrast")).toBe("high-contrast");
    });

    it("deve retornar o fallback padrão ('dark') quando o valor for inválido", () => {
      expect(parseTheme("invalid-mode")).toBe("dark");
      expect(parseTheme(null)).toBe("dark");
      expect(parseTheme(undefined)).toBe("dark");
    });

    it("deve respeitar um fallback customizado se fornecido", () => {
      expect(parseTheme("invalid-mode", "light")).toBe("light");
      expect(parseTheme(undefined, "high-contrast")).toBe("high-contrast");
    });
  });

  describe("generateThemeVars", () => {
    it("deve gerar variáveis CSS com tokens de alto contraste adequados", () => {
      const vars = generateThemeVars("high-contrast");
      expect(vars["--background"]).toBe("oklch(0 0 0)");
      expect(vars["--foreground"]).toBe("oklch(1 0 0)");
      expect(vars["--border"]).toBe("oklch(1 0 0)");
      expect(vars["--primary"]).toBe("oklch(0.97 0.2 105)");
    });

    it("deve gerar variáveis CSS para dark e light", () => {
      const darkVars = generateThemeVars("dark");
      const lightVars = generateThemeVars("light");
      expect(darkVars["--background"]).toBeDefined();
      expect(lightVars["--background"]).toBeDefined();
      expect(darkVars["--background"]).not.toBe(lightVars["--background"]);
    });
  });
});

