// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useLang } from "../useLang";

const { routerReplaceMock } = vi.hoisted(() => ({ routerReplaceMock: vi.fn() }));

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
  usePathname: () => "/definir-senha-inicial",
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "pt" }),
}));

describe("useLang", () => {
  beforeEach(() => {
    routerReplaceMock.mockClear();
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("deve trocar o idioma mantendo a query string", () => {
    window.history.replaceState(null, "", "/pt/definir-senha-inicial?email=ana%40exemplo.com&token=abc");

    const { result } = renderHook(() => useLang());
    result.current.changeLocale("en");

    expect(routerReplaceMock).toHaveBeenCalledWith(
      "/definir-senha-inicial?email=ana%40exemplo.com&token=abc",
      { locale: "en" }
    );
  });

  it("deve trocar o idioma de uma página sem query string", () => {
    window.history.replaceState(null, "", "/pt/definir-senha-inicial");

    const { result } = renderHook(() => useLang());
    result.current.changeLocale("en");

    expect(routerReplaceMock).toHaveBeenCalledWith("/definir-senha-inicial", { locale: "en" });
  });
});
