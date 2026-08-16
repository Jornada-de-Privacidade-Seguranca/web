// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import { AuthView } from "../index";
import * as viewModelModule from "../auth.viewmodel";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("AuthView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockLabels = {
    title: "Privacy Compass",
    description: "Avalie seu conhecimento em privacidade e segurança",
    welcomeTitle: "Bem-vindo de volta",
    welcomeDescription: "Entre com sua conta para continuar",
    usernameLabel: "USUÁRIO",
    usernamePlaceholder: "Ex.: usuario",
    passwordLabel: "SENHA",
    passwordPlaceholder: "********",
    forgotPassword: "Esqueci minha senha",
    submit: "Entrar",
    signUpPrefix: "Não possui uma conta?",
    signUpLink: "Cadastre-se",
    privacyNotice: "Ao continuar você aceita nossos termos.",
  };

  function createMockVMReturn(
    overrides?: Partial<ReturnType<typeof viewModelModule.useAuthVM>>
  ) {
    return {
      form: {
        register: vi.fn(() => ({
          name: "",
          onChange: vi.fn(),
          onBlur: vi.fn(),
          ref: vi.fn(),
        })),
        formState: { errors: {}, isSubmitting: false },
      } as unknown as ReturnType<typeof viewModelModule.useAuthVM>["form"],
      serverMessage: null,
      onCloseMsg: vi.fn(),
      handleSubmit: vi.fn((e?: React.BaseSyntheticEvent) => {
        e?.preventDefault?.();
      }),
      labels: mockLabels,
      ...overrides,
    };
  }

  it("deve renderizar o link de cadastro apontando para /cadastro", () => {
    vi.spyOn(viewModelModule, "useAuthVM").mockReturnValue(
      createMockVMReturn()
    );

    render(<AuthView />);

    const link = screen.getByRole("link", { name: "Cadastre-se" });
    expect(link.getAttribute("href")).toBe("/cadastro");
  });
});
