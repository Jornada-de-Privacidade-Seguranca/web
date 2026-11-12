// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import ptMessages from "@/messages/pt.json";
import enMessages from "@/messages/en.json";
import { PrivacyPolicyView } from "../index";

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/layout/IdiomSwitch", () => ({
  IdiomSwitch: () => <div data-testid="idiom-switch">PT | EN</div>,
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
    vi.clearAllMocks();
  });

  it("deve renderizar a tela pública do termo em português no padrão visual do login/cadastro", () => {
    renderWithLocale("pt");

    // Header com IdiomSwitch e SwitchThemeButton
    expect(screen.getByTestId("idiom-switch")).toBeDefined();
    expect(screen.getByLabelText("theme-switch")).toBeDefined();

    // Topo com nome e subtítulo da aplicação
    expect(screen.getByRole("heading", { level: 1, name: "Privacy Compass" })).toBeDefined();
    expect(
      screen.getByText("Avalie seu conhecimento em privacidade e segurança")
    ).toBeDefined();

    // Cartão central do termo
    expect(
      screen.getByRole("heading", { level: 2, name: "Termo de privacidade" })
    ).toBeDefined();

    // Aviso do protótipo sobre LGPD
    expect(
      screen.getByText(/Este termo de privacidade está em fase de elaboração e validação/i)
    ).toBeDefined();
    expect(screen.getByText(/LGPD — Lei nº 13\.709\/2018/i)).toBeDefined();

    // Botão Voltar
    const backBtn = screen.getByRole("button", { name: "Voltar" });
    expect(backBtn).toBeDefined();

    fireEvent.click(backBtn);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("deve renderizar corretamente os textos em inglês após a troca de idioma", () => {
    renderWithLocale("en");

    expect(screen.getByTestId("idiom-switch")).toBeDefined();
    expect(screen.getByRole("heading", { level: 1, name: "Privacy Compass" })).toBeDefined();
    expect(
      screen.getByText("Assess your knowledge in privacy and security")
    ).toBeDefined();

    expect(
      screen.getByRole("heading", { level: 2, name: "Privacy terms" })
    ).toBeDefined();
    expect(
      screen.getByText(/This privacy policy is currently being drafted and validated/i)
    ).toBeDefined();

    const backBtn = screen.getByRole("button", { name: "Back" });
    expect(backBtn).toBeDefined();
  });
});
