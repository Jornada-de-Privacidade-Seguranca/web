// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import ptMessages from "@/messages/pt.json";
import enMessages from "@/messages/en.json";
import { PrivacyPolicyView } from "../index";

let mockIsAuthenticated = false;

vi.mock("@hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
  }),
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/layout/IdiomSwitch", () => ({
  IdiomSwitch: () => <div data-testid="idiom-switch" />,
}));

vi.mock("@/components/layout/SwitchThemeButton", () => ({
  SwitchThemeButton: () => <button type="button" aria-label="theme-switch" />,
}));

function renderWithLocale(locale: "pt" | "en") {
  const messages = locale === "en" ? enMessages : ptMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PrivacyPolicyView />
    </NextIntlClientProvider>
  );
}

describe("PrivacyPolicyView", () => {
  beforeEach(() => {
    cleanup();
    mockIsAuthenticated = false;
  });

  it("deve renderizar o termo de privacidade completo em português com índice e seções LGPD", () => {
    renderWithLocale("pt");

    expect(screen.getByRole("heading", { level: 1, name: "Termo de Privacidade" })).toBeDefined();
    expect(screen.getByText("LGPD · Lei nº 13.709/2018")).toBeDefined();

    const toc = screen.getByRole("navigation", { name: "Índice de seções" });
    const tocLinks = within(toc).getAllByRole("link");
    expect(tocLinks).toHaveLength(7);
    expect(tocLinks[1].getAttribute("href")).toBe("#dados-coletados");

    expect(
      screen.getByRole("heading", { level: 2, name: "Dados Pessoais Coletados" })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: "Segurança da Informação" })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: "Direitos do Titular (LGPD)" })
    ).toBeDefined();

    expect(screen.getByRole("link", { name: "Voltar ao início" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
  });

  it("deve renderizar corretamente em inglês e adaptar links quando autenticado", () => {
    mockIsAuthenticated = true;
    renderWithLocale("en");

    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: "Personal Data Collected" })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: "Your Privacy Rights" })
    ).toBeDefined();

    expect(
      screen.getByRole("link", { name: "Back to dashboard" }).getAttribute("href")
    ).toBe("/painel");
    expect(
      screen.getByRole("link", { name: "Go to dashboard" }).getAttribute("href")
    ).toBe("/painel");
  });
});

