// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import ptMessages from "@/messages/pt.json";
import enMessages from "@/messages/en.json";
import { usePrivacyPolicyVM } from "../privacyPolicy.viewmodel";

let mockIsAuthenticated = false;

vi.mock("@hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    `${namespace ? `${namespace}.` : ""}${key}`,
}));

describe("usePrivacyPolicyVM", () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
  });

  it("deve estruturar todas as seções legais do termo de privacidade", () => {
    const { result } = renderHook(() => usePrivacyPolicyVM());

    expect(result.current.sections).toHaveLength(7);
    expect(result.current.sections.map((s) => s.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
    ]);
    expect(result.current.sections[1].bullets).toHaveLength(3);
    expect(result.current.sections[2].bullets).toHaveLength(4);
    expect(result.current.sections[4].bullets).toHaveLength(4);
    expect(result.current.sections[5].bullets).toHaveLength(4);
  });

  it("deve apontar links de retorno e CTA para / e /login quando visitante", () => {
    mockIsAuthenticated = false;
    const { result } = renderHook(() => usePrivacyPolicyVM());

    expect(result.current.backHref).toBe("/");
    expect(result.current.primaryCtaHref).toBe("/login");
    expect(result.current.labels.backLinkLabel).toBe("privacyPolicy.backToHome");
  });

  it("deve apontar links de retorno e CTA para /painel quando autenticado", () => {
    mockIsAuthenticated = true;
    const { result } = renderHook(() => usePrivacyPolicyVM());

    expect(result.current.backHref).toBe("/painel");
    expect(result.current.primaryCtaHref).toBe("/painel");
    expect(result.current.labels.backLinkLabel).toBe("privacyPolicy.backToDashboard");
    expect(result.current.labels.primaryCtaLabel).toBe("privacyPolicy.goToDashboard");
  });

  it("deve possuir traduções completas e simétricas em PT e EN", () => {
    expect(Object.keys(ptMessages.privacyPolicy)).toEqual(
      Object.keys(enMessages.privacyPolicy)
    );
    expect(Object.keys(ptMessages.privacyPolicy.sections)).toEqual(
      Object.keys(enMessages.privacyPolicy.sections)
    );

    for (const [sectionKey, ptSection] of Object.entries(ptMessages.privacyPolicy.sections)) {
      const enSection =
        enMessages.privacyPolicy.sections[
          sectionKey as keyof typeof enMessages.privacyPolicy.sections
        ];
      expect(Object.keys(ptSection)).toEqual(Object.keys(enSection));
      for (const value of Object.values(ptSection)) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
      for (const value of Object.values(enSection)) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

