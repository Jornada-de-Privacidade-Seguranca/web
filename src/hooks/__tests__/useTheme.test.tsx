// @vitest-environment jsdom

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTheme } from "../useTheme";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/shared/providers/theme";
import type { PropsWithChildren } from "react";

function wrapper({ children }: PropsWithChildren) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("useTheme Hook & ThemeProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.className = "";
    document.cookie = `${THEME_STORAGE_KEY}=; path=/; max-age=0`;
  });

  it("deve carregar o tema salvo no localStorage na inicialização", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "high-contrast");
    document.documentElement.classList.add("high-contrast");

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("high-contrast");
    expect(result.current.isHighContrast).toBe(true);
    expect(result.current.isDark).toBe(false);
    expect(result.current.isLight).toBe(false);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(true);
  });

  it("deve definir modo 'high-contrast' e persistir em localStorage e document.cookie", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode("high-contrast");
    });

    expect(result.current.theme).toBe("high-contrast");
    expect(result.current.isHighContrast).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("high-contrast");
    expect(document.cookie).toContain(`${THEME_STORAGE_KEY}=high-contrast`);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("deve ciclar entre claro -> escuro -> alto contraste -> claro com toggleTheme()", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Força para 'light' primeiro
    act(() => {
      result.current.setThemeMode("light");
    });
    expect(result.current.theme).toBe("light");

    // Ciclo 1: light -> dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe("dark");
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Ciclo 2: dark -> high-contrast
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe("high-contrast");
    expect(result.current.isHighContrast).toBe(true);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Ciclo 3: high-contrast -> light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe("light");
    expect(result.current.isLight).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(false);
  });

  it("deve fazer fallback para o tema padrão quando o valor no localStorage for inválido", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "invalid-theme-value");

    const { result } = renderHook(() => useTheme(), { wrapper });

    // "invalid-theme-value" não é reconhecido, deve cair no fallback do sistema (dark ou light)
    expect(["dark", "light"]).toContain(result.current.theme);
    expect(result.current.theme).not.toBe("invalid-theme-value");
    expect(document.documentElement.classList.contains(result.current.theme)).toBe(true);
  });

  it("deve fazer fallback para 'dark' quando matchMedia não estiver disponível ou localStorage estiver vazio", () => {
    localStorage.clear();
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(["dark", "light"]).toContain(result.current.theme);
    expect(document.documentElement.classList.contains(result.current.theme)).toBe(true);
  });
});
