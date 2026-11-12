// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, renderHook, screen, fireEvent } from "@testing-library/react";
import { useForm } from "react-hook-form";
import React from "react";

import { InitialPasswordView } from "../index";
import * as viewModelModule from "../initialPassword.viewmodel";
import type {
  InitialPasswordFormValues,
  InitialPasswordLabels,
  InitialPasswordViewModelReturn,
} from "../initialPassword.types";

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const labels: InitialPasswordLabels = {
  appName: "Privacy Compass",
  tagline: "Avalie seu conhecimento em privacidade e segurança",
  title: "Ative sua conta",
  subtitle: "Complete seus dados e defina sua senha para acessar a plataforma.",
  validating: "Validando o convite...",
  invalidInvitation:
    "Este convite é inválido, expirou ou já foi usado. Peça um novo convite ao administrador.",
  backToLogin: "Voltar ao login",
  validationFailed: "Não foi possível validar o convite. Tente novamente.",
  retry: "Tentar novamente",
  emailLabel: "E-MAIL",
  fullNameLabel: "NOME COMPLETO",
  fullNamePlaceholder: "Ex.: Maria Silva",
  companyLabel: "EMPRESA",
  companyPlaceholder: "Ex.: ACME Corp",
  departmentLabel: "DEPARTAMENTO",
  departmentPlaceholder: "Ex.: Tecnologia",
  employeeCodeLabel: "CÓDIGO DE FUNCIONÁRIO",
  employeeCodePlaceholder: "Ex.: 00123456",
  passwordLabel: "SENHA",
  passwordPlaceholder: "Mínimo 8 caracteres",
  confirmPasswordLabel: "CONFIRMAR SENHA",
  confirmPasswordPlaceholder: "Repita sua senha",
  submit: "Ativar conta",
  submitting: "Ativando...",
};

function mockViewModel(overrides: Partial<InitialPasswordViewModelReturn> = {}) {
  const { result } = renderHook(() => useForm<InitialPasswordFormValues>());
  const viewModel: InitialPasswordViewModelReturn = {
    status: "ready",
    email: "ana@exemplo.com",
    form: result.current,
    isSubmitting: false,
    serverMessage: null,
    onCloseMsg: vi.fn(),
    handleSubmit: vi.fn(),
    handleRetry: vi.fn(),
    labels,
    ...overrides,
  };
  vi.spyOn(viewModelModule, "useInitialPasswordVM").mockReturnValue(viewModel);
  return viewModel;
}

describe("InitialPasswordView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve mostrar o formulário com o e-mail do link sem edição", () => {
    mockViewModel();
    render(<InitialPasswordView />);

    expect(screen.getByRole("heading", { name: "Ative sua conta" })).toBeTruthy();
    const email = screen.getByLabelText("E-MAIL") as HTMLInputElement;
    expect(email.value).toBe("ana@exemplo.com");
    expect(email.readOnly).toBe(true);
    for (const label of ["NOME COMPLETO", "EMPRESA", "DEPARTAMENTO", "CÓDIGO DE FUNCIONÁRIO", "SENHA", "CONFIRMAR SENHA"]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "Ativar conta" })).toBeTruthy();
  });

  it("não deve mostrar o formulário no link inválido, só o aviso e o link para o login", () => {
    mockViewModel({ status: "invalid" });
    render(<InitialPasswordView />);

    expect(screen.getByRole("alert").textContent).toBe(labels.invalidInvitation);
    expect(screen.getByRole("link", { name: "Voltar ao login" }).getAttribute("href")).toBe("/login");
    expect(screen.queryByLabelText("E-MAIL")).toBeNull();
    expect(screen.queryByRole("button", { name: "Ativar conta" })).toBeNull();
  });

  it("deve mostrar o carregamento enquanto valida o convite", () => {
    mockViewModel({ status: "validating" });
    render(<InitialPasswordView />);

    expect(screen.getByRole("status").textContent).toBe("Validando o convite...");
    expect(screen.queryByLabelText("E-MAIL")).toBeNull();
  });

  it("deve permitir tentar de novo quando a validação falhar", () => {
    const viewModel = mockViewModel({ status: "validation_failed" });
    render(<InitialPasswordView />);

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(viewModel.handleRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText("E-MAIL")).toBeNull();
  });

  it("deve desabilitar o envio e mostrar o carregamento durante o envio", () => {
    mockViewModel({ isSubmitting: true });
    render(<InitialPasswordView />);

    const button = screen.getByRole("button", { name: "Ativando..." }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("deve mostrar a falha do envio no aviso", () => {
    mockViewModel({
      serverMessage: { title: "Não foi possível ativar a conta. Tente novamente.", variant: "destructive" },
    });
    render(<InitialPasswordView />);

    expect(screen.getByText("Não foi possível ativar a conta. Tente novamente.")).toBeTruthy();
  });
});
