// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import ptMessages from "@/messages/pt.json";
import enMessages from "@/messages/en.json";
import { LandingView } from "../index";

vi.mock("@/hooks/useAuthGuard", () => ({
  useRequireGuest: () => ({ isLoading: false, isAuthenticated: false }),
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
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

function renderLanding(locale: "pt" | "en") {
  const messages = locale === "en" ? enMessages : ptMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LandingView />
    </NextIntlClientProvider>
  );
}

describe("LandingView", () => {
  beforeEach(() => {
    cleanup();
  });

  it("deve renderizar o hero, os 6 passos, o bloco Extra, as setas decorativas e o rodapé em português", () => {
    renderLanding("pt");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Descubra seu nível de conhecimento em privacidade e segurança da informação",
      })
    ).toBeDefined();
    expect(
      screen.getByText(
        "Questionários de autodiagnóstico que mapeiam o nível de conhecimento da sua equipe e mostram onde investir em capacitação."
      )
    ).toBeDefined();
    expect(screen.getByRole("link", { name: "Acessar plataforma" }).getAttribute("href")).toBe(
      "/login"
    );
    expect(screen.getByRole("link", { name: "Ver como funciona" }).getAttribute("href")).toBe(
      "#como-funciona"
    );

    expect(screen.getByText("Seis passos para diagnosticar e evoluir.")).toBeDefined();

    for (const stepTitle of [
      "Faça login",
      "Escolha o perfil",
      "Responda o questionário",
      "Receba o diagnóstico",
      "Busque conhecimento",
      "Refaça o questionário",
    ]) {
      expect(screen.getByRole("heading", { level: 3, name: stepTitle })).toBeDefined();
    }

    // Passo 03 menciona apenas competências (sem "experiência")
    expect(
      screen.getByText("Responda às perguntas sobre suas competências no perfil.")
    ).toBeDefined();

    // Bloco Extra
    expect(screen.getByText("Extra")).toBeDefined();
    expect(screen.getByRole("heading", { level: 3, name: "Vá além" })).toBeDefined();
    expect(
      screen.getByText("Atingiu 100% na jornada de um perfil? Faça a jornada de outro perfil.")
    ).toBeDefined();

    // Setas decorativas ocultas para leitores de tela
    for (const num of ["01", "02", "04", "05"]) {
      expect(screen.getByTestId(`step-${num}-arrow-right`).getAttribute("aria-hidden")).toBe("true");
    }
    for (const num of ["01", "02", "03", "04", "05", "06"]) {
      expect(screen.getByTestId(`step-${num}-arrow-down`).getAttribute("aria-hidden")).toBe("true");
    }

    expect(screen.getByRole("link", { name: "Termo de Privacidade" }).getAttribute("href")).toBe(
      "/privacy-terms"
    );
  });

  it("deve renderizar corretamente em inglês", () => {
    renderLanding("en");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Discover your knowledge level in privacy and information security",
      })
    ).toBeDefined();
    expect(screen.getByText("Six steps to diagnose and evolve.")).toBeDefined();

    for (const stepTitle of [
      "Sign in",
      "Choose your profile",
      "Answer the questionnaire",
      "Receive your diagnosis",
      "Seek knowledge",
      "Retake the questionnaire",
    ]) {
      expect(screen.getByRole("heading", { level: 3, name: stepTitle })).toBeDefined();
    }

    expect(screen.getByRole("heading", { level: 3, name: "Go further" })).toBeDefined();
    expect(
      screen.getByText(
        "Reached 100% on one profile's journey? Take another profile's journey."
      )
    ).toBeDefined();
    expect(screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("href")).toBe(
      "/privacy-terms"
    );
  });
});
