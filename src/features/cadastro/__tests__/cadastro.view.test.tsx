// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as cadastroService from "@services/cadastroService";
import React from "react";

import { CadastroView } from "../index";
import * as viewModelModule from "../cadastro.viewmodel";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock i18n navigation link
vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
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
    departmentLabel: "SETOR",
    departmentPlaceholder: "Ex.: Tecnologia",
    companyLabel: "ÓRGÃO/EMPRESA",
    companyPlaceholder: "Ex.: Prefeitura de Recife ou Empresa Exemplo",
    emailLabel: "E-MAIL INSTITUCIONAL",
    emailPlaceholder: "voce@empresa.com",
    passwordLabel: "SENHA",
    passwordPlaceholder: "Mínimo 8 caracteres",
    confirmPasswordLabel: "CONFIRMAR SENHA",
    confirmPasswordPlaceholder: "Repita sua senha",
    termsCheckboxPrefix: "Li e aceito o",
    termsCheckboxLink: "termo de privacidade",
    termsCheckboxSuffix: ".",
    termsLinkNewTab: "(abre em outra aba)",
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
      isSuccess: false,
      ...overrides,
    };
  }

  it("deve renderizar o campo de empresa", () => {
    vi.spyOn(viewModelModule, "useCadastroVM").mockReturnValue(createMockVMReturn());

    render(<CadastroView />);

    expect(screen.getByLabelText("ÓRGÃO/EMPRESA")).toBeDefined();
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

  it("deve mostrar os campos na ordem do protótipo, com Setor e Órgão/Empresa", () => {
    vi.spyOn(viewModelModule, "useCadastroVM").mockReturnValue(createMockVMReturn());

    const { container } = render(<CadastroView />);

    const order = [...container.querySelectorAll("input:not([type=checkbox])")].map((input) => input.id);
    expect(order).toEqual([
      "nomeCompleto",
      "empresa",
      "codigoFuncionario",
      "departamento",
      "email",
      "senha",
      "confirmarSenha",
    ]);
    expect(screen.getByText("SETOR")).toBeDefined();
    expect(screen.queryByText(/departamento/i)).toBeNull();
    expect(screen.getByLabelText("ÓRGÃO/EMPRESA").getAttribute("placeholder")).toBe(
      "Ex.: Prefeitura de Recife ou Empresa Exemplo"
    );
    // Código e Setor lado a lado só a partir do md; no celular, um embaixo do outro
    expect(screen.getByLabelText("SETOR").closest(".grid")?.className).toContain("grid-cols-1 gap-4 md:grid-cols-2");
  });

  it("deve ligar o aceite ao link do termo, que abre em outra aba", () => {
    vi.spyOn(viewModelModule, "useCadastroVM").mockReturnValue(createMockVMReturn());

    render(<CadastroView />);

    const link = screen.getByRole("link", { name: /termo de privacidade/ });
    expect(link.getAttribute("href")).toBe("/privacy-terms");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.textContent).toBe("termo de privacidade (abre em outra aba)");
    expect(
      screen.getByRole("checkbox", { name: "Li e aceito o termo de privacidade" })
    ).toBeDefined();
  });

  it("deve ligar a mensagem de erro do aceite à caixa para leitores de tela", () => {
    vi.spyOn(viewModelModule, "useCadastroVM").mockReturnValue(
      createMockVMReturn({
        form: {
          register: vi.fn(() => ({ name: "", onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() })),
          formState: {
            errors: { aceitouTermos: { message: "Você precisa aceitar o termo de privacidade." } },
            isSubmitting: false,
          },
        } as unknown as ReturnType<typeof viewModelModule.useCadastroVM>["form"],
      })
    );

    render(<CadastroView />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.getAttribute("aria-invalid")).toBe("true");
    expect(checkbox.getAttribute("aria-describedby")).toBe("aceitouTermos-error");
    expect(document.getElementById("aceitouTermos-error")?.textContent).toBe(
      "Você precisa aceitar o termo de privacidade."
    );
  });

  describe("com a ViewModel real", () => {
    function fillValidFields() {
      const values: Record<string, string> = {
        nomeCompleto: "Maria Silva",
        empresa: "Prefeitura Exemplo",
        codigoFuncionario: "00123456",
        departamento: "Tecnologia",
        email: "maria@empresa.com",
        senha: "senha-segura",
        confirmarSenha: "senha-segura",
      };
      for (const [id, value] of Object.entries(values)) {
        fireEvent.change(document.getElementById(id) as HTMLInputElement, { target: { value } });
      }
    }

    it("clicar no link do termo não marca nem desmarca a caixa", () => {
      render(<CadastroView />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      const link = screen.getByRole("link", { name: /terms\.link/ });
      link.addEventListener("click", (event) => event.preventDefault());

      fireEvent.click(link);
      expect(checkbox.checked).toBe(false);

      fireEvent.click(screen.getByText("terms.prefix"));
      expect(checkbox.checked).toBe(true);

      fireEvent.click(link);
      expect(checkbox.checked).toBe(true);
    });

    it("não envia sem o aceite e mostra a mensagem do termo", async () => {
      const registerSpy = vi.spyOn(cadastroService, "registerUser");
      render(<CadastroView />);

      fillValidFields();
      fireEvent.click(screen.getByRole("button", { name: "submit" }));

      await waitFor(() =>
        expect(document.getElementById("aceitouTermos-error")?.textContent).toBe(
          "validation.termsRequired"
        )
      );
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("mostra a mensagem de cada campo obrigatório vazio", async () => {
      render(<CadastroView />);

      fireEvent.click(screen.getByRole("button", { name: "submit" }));

      for (const message of [
        "validation.fullNameRequired",
        "validation.companyRequired",
        "validation.employeeCodeRequired",
        "validation.departmentRequired",
        "validation.emailRequired",
        "validation.passwordRequired",
        "validation.confirmPasswordRequired",
        "validation.termsRequired",
      ]) {
        expect(await screen.findByText(message)).toBeDefined();
      }
    });
  });
});
