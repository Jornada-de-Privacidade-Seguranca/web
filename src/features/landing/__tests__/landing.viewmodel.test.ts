// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import ptMessages from "@/messages/pt.json";
import enMessages from "@/messages/en.json";
import { useLandingVM } from "../landing.viewmodel";

let mockGuard = { isLoading: false, isAuthenticated: false };

vi.mock("@/hooks/useAuthGuard", () => ({
  useRequireGuest: () => mockGuard,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    `${namespace ? `${namespace}.` : ""}${key}`,
}));

function collectStrings(obj: unknown): string[] {
  if (typeof obj === "string") return [obj];
  if (obj && typeof obj === "object") {
    return Object.values(obj).flatMap(collectStrings);
  }
  return [];
}

describe("useLandingVM", () => {
  beforeEach(() => {
    mockGuard = { isLoading: false, isAuthenticated: false };
  });

  it("deve estruturar os 6 passos com setas corretas e o bloco Extra", () => {
    const { result } = renderHook(() => useLandingVM());

    expect(result.current.isReady).toBe(true);
    expect(result.current.steps).toHaveLength(6);
    expect(result.current.steps.map((s) => s.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
    ]);

    expect(result.current.steps.map((s) => s.showRightArrowOnDesktop)).toEqual([
      true,
      true,
      false,
      true,
      true,
      false,
    ]);
    expect(result.current.steps.map((s) => s.showDownArrowOnDesktop)).toEqual([
      false,
      false,
      true,
      false,
      false,
      true,
    ]);

    expect(result.current.extra.badge).toBe("landing.extra.badge");
    expect(result.current.extra.title).toBe("landing.extra.title");
    expect(result.current.extra.description).toBe("landing.extra.description");
  });

  it("deve ocultar conteúdo enquanto verifica sessão ou se usuário estiver autenticado", () => {
    mockGuard = { isLoading: true, isAuthenticated: false };
    expect(renderHook(() => useLandingVM()).result.current.isReady).toBe(false);

    mockGuard = { isLoading: false, isAuthenticated: true };
    expect(renderHook(() => useLandingVM()).result.current.isReady).toBe(false);
  });

  it("deve ter chaves landing simétricas em PT e EN e sem o termo 'avaliação'/'assessment'", () => {
    expect(Object.keys(ptMessages.landing)).toEqual(Object.keys(enMessages.landing));
    for (const key of Object.keys(ptMessages.landing) as (keyof typeof ptMessages.landing)[]) {
      const ptVal = ptMessages.landing[key];
      const enVal = enMessages.landing[key];
      if (typeof ptVal === "object" && ptVal !== null && typeof enVal === "object" && enVal !== null) {
        expect(Object.keys(ptVal)).toEqual(Object.keys(enVal));
      }
    }

    const ptTexts = collectStrings(ptMessages.landing);
    const enTexts = collectStrings(enMessages.landing);

    for (const text of ptTexts) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text.toLowerCase()).not.toMatch(/avaliaç/);
    }
    for (const text of enTexts) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text.toLowerCase()).not.toMatch(/assessment/);
    }
  });
});
