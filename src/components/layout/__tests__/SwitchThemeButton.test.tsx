// @vitest-environment jsdom

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SwitchThemeButton } from "../SwitchThemeButton";
import * as useThemeModule from "@/hooks/useTheme";

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const messages: Record<string, string> = {
      light: "Trocar para tema claro",
      dark: "Trocar para tema escuro",
      highContrast: "Trocar para tema de alto contraste",
    };
    return (key: string) => messages[key] ?? key;
  },
}));

describe("SwitchThemeButton Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar botão com aria-label para tema escuro quando o tema for claro", () => {
    const toggleThemeMock = vi.fn();
    vi.spyOn(useThemeModule, "useTheme").mockReturnValue({
      theme: "light",
      isDark: false,
      isLight: true,
      isHighContrast: false,
      mounted: true,
      toggleTheme: toggleThemeMock,
      setThemeMode: vi.fn(),
    });

    render(<SwitchThemeButton />);

    const button = screen.getByRole("button", {
      name: "Trocar para tema escuro",
    });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar botão com aria-label para alto contraste quando o tema for escuro", () => {
    const toggleThemeMock = vi.fn();
    vi.spyOn(useThemeModule, "useTheme").mockReturnValue({
      theme: "dark",
      isDark: true,
      isLight: false,
      isHighContrast: false,
      mounted: true,
      toggleTheme: toggleThemeMock,
      setThemeMode: vi.fn(),
    });

    render(<SwitchThemeButton />);

    const button = screen.getByRole("button", {
      name: "Trocar para tema de alto contraste",
    });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar botão com aria-label para tema claro quando o tema for alto contraste", () => {
    const toggleThemeMock = vi.fn();
    vi.spyOn(useThemeModule, "useTheme").mockReturnValue({
      theme: "high-contrast",
      isDark: false,
      isLight: false,
      isHighContrast: true,
      mounted: true,
      toggleTheme: toggleThemeMock,
      setThemeMode: vi.fn(),
    });

    render(<SwitchThemeButton />);

    const button = screen.getByRole("button", {
      name: "Trocar para tema claro",
    });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
