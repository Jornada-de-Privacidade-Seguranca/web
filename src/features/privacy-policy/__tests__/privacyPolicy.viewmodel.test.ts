// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import ptMessages from "@/messages/pt.json";
import enMessages from "@/messages/en.json";
import { usePrivacyPolicyVM } from "../privacyPolicy.viewmodel";

const mockBack = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    `${namespace ? `${namespace}.` : ""}${key}`,
}));

describe("usePrivacyPolicyVM", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
      writable: true,
    });
  });

  it("deve carregar os rótulos do cartão central do termo de privacidade", () => {
    const { result } = renderHook(() => usePrivacyPolicyVM());

    expect(result.current.labels.title).toBe("privacyPolicy.title");
    expect(result.current.labels.subtitle).toBe("privacyPolicy.subtitle");
    expect(result.current.labels.cardTitle).toBe("privacyPolicy.cardTitle");
    expect(result.current.labels.notice).toBe("privacyPolicy.notice");
    expect(result.current.labels.backButton).toBe("privacyPolicy.back");
  });

  it("deve chamar router.back() quando houver página anterior da própria aplicação", () => {
    Object.defineProperty(document, "referrer", {
      value: "http://localhost:3000/cadastro",
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => usePrivacyPolicyVM());

    act(() => {
      result.current.handleBack();
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("deve redirecionar para /login quando a página for aberta diretamente sem histórico anterior", () => {
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => usePrivacyPolicyVM());

    act(() => {
      result.current.handleBack();
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("deve redirecionar para a rota indicada no parâmetro ?from= quando fornecido", () => {
    mockSearchParams = new URLSearchParams("from=/cadastro");

    const { result } = renderHook(() => usePrivacyPolicyVM());

    expect(result.current.backHref).toBe("/cadastro");

    act(() => {
      result.current.handleBack();
    });

    expect(mockPush).toHaveBeenCalledWith("/cadastro");
    expect(mockBack).not.toHaveBeenCalled();
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
