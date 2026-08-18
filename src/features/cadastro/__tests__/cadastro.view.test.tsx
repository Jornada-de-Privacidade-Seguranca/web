// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import { CadastroView } from "../index";
import * as viewModelModule from "../cadastro.viewmodel";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock i18n navigation link
vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("CadastroView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockLabels = {
    title: "Privacy Compass",
    description: "Avalie seu conhecimento em privacidade e segurança",
    cardTitle: "Criar sua conta",
    cardSubtitle: "Cadastre-se com seus dados corporativos",
    fullNameLabel: "NOME COMPLETO",
    fullNamePlaceholder: "Ex.: Maria Silva",
    employeeCodeLabel: "CÓDIGO DE FUNCIONÁRIO",
    employeeCodePlaceholder: "Ex.: 00123456",
    departmentLabel: "DEPARTAMENTO",
    departmentPlaceholder: "Ex.: Tecnologia",
    companyLabel: "EMPRESA",
    companyPlaceholder: "Ex.: ACME Corp",
    emailLabel: "E-MAIL INSTITUCIONAL",
    emailPlaceholder: "voce@empresa.com",
    passwordLabel: "SENHA",
    passwordPlaceholder: "Mínimo 8 caracteres",
    confirmPasswordLabel: "CONFIRMAR SENHA",
    confirmPasswordPlaceholder: "Repita sua senha",
    termsCheckbox: "Aceito os termos de uso",
    submit: "Criar conta",
    hasAccountText: "Já possui uma conta?",
    loginLink: "Entrar",
  };

  function createMockVMReturn(
    overrides?: Partial<ReturnType<typeof viewModelModule.useCadastroVM>>
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
      } as unknown as ReturnType<typeof viewModelModule.useCadastroVM>["form"],
      serverMessage: null,
      onCloseMsg: vi.fn(),
      handleSubmit: vi.fn((e?: React.BaseSyntheticEvent) => {
        e?.preventDefault?.();
        return Promise.resolve();
      }),
      labels: mockLabels,
      isGeneralSystem: true,
      isSuccess: false,
      ...overrides,
    };
  }

  it("deve renderizar o campo de empresa quando isGeneralSystem é true", () => {
    vi.spyOn(viewModelModule, "useCadastroVM").mockReturnValue(
      createMockVMReturn({ isGeneralSystem: true })
    );

    render(<CadastroView />);

    expect(screen.getByLabelText("EMPRESA")).toBeDefined();
  });

  it("não deve renderizar o campo de empresa quando isGeneralSystem é false", () => {
    vi.spyOn(viewModelModule, "useCadastroVM").mockReturnValue(
      createMockVMReturn({ isGeneralSystem: false })
    );

    render(<CadastroView />);

    expect(screen.queryByLabelText("EMPRESA")).toBeNull();
  });

  it("deve exibir mensagem do servidor quando serverMessage estiver presente", () => {
    const mockOnClose = vi.fn();
    vi.spyOn(viewModelModule, "useCadastroVM").mockReturnValue(
      createMockVMReturn({
        serverMessage: {
          title: "Erro no servidor",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        },
        onCloseMsg: mockOnClose,
      })
    );

    render(<CadastroView />);

    expect(screen.getByText("Erro no servidor")).toBeDefined();
    expect(screen.getByText("Tente novamente mais tarde.")).toBeDefined();
  });

  it("deve desabilitar o botão de submit quando isSubmitting for true", () => {
    vi.spyOn(viewModelModule, "useCadastroVM").mockReturnValue(
      createMockVMReturn({
        form: {
          register: vi.fn(() => ({
            name: "",
            onChange: vi.fn(),
            onBlur: vi.fn(),
            ref: vi.fn(),
          })),
          formState: { errors: {}, isSubmitting: true },
        } as unknown as ReturnType<typeof viewModelModule.useCadastroVM>["form"],
      })
    );

    render(<CadastroView />);

    const submitBtn = screen.getByRole("button", {
      name: "Criar conta",
    }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });
});
