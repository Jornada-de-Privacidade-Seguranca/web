// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "../useMobile";

type ChangeListener = () => void;

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<ChangeListener>();
  const mql = {
    matches: initialMatches,
    addEventListener: vi.fn((_: string, listener: ChangeListener) => listeners.add(listener)),
    removeEventListener: vi.fn((_: string, listener: ChangeListener) => listeners.delete(listener)),
  };
  const matchMedia = vi.fn(() => mql);
  vi.stubGlobal("matchMedia", matchMedia);

  return {
    mql,
    matchMedia,
    listeners,
    setMatches(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("useIsMobile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve consultar o breakpoint md e refletir a largura atual após montar", () => {
    const media = mockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(media.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
    expect(result.current).toBe(true);
  });

  it("deve começar como desktop quando a tela é larga", () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("deve acompanhar a troca de largura", () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());

    act(() => media.setMatches(true));
    expect(result.current).toBe(true);

    act(() => media.setMatches(false));
    expect(result.current).toBe(false);
  });

  it("deve remover o listener ao desmontar", () => {
    const media = mockMatchMedia(false);
    const { unmount } = renderHook(() => useIsMobile());

    expect(media.listeners.size).toBe(1);
    unmount();

    expect(media.mql.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(media.listeners.size).toBe(0);
  });
});
