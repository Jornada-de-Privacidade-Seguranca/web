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

describe("AuthView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockLabels = {
    title: "Privacy Compass",
    description: "Avalie seu conhecimento em privacidade e segurança",
    welcomeTitle: "Bem-vindo de volta",
    welcomeDescription: "Entre com sua conta para continuar",
    emailLabel: "E-MAIL",
    emailPlaceholder: "Ex.: usuario@empresa.com",
    passwordLabel: "SENHA",
    passwordPlaceholder: "********",
    submit: "Entrar",
    signUpPrefix: "Não possui uma conta?",
    signUpLink: "Cadastre-se",
    privacyNoticePrefix: "Ao continuar você aceita nosso",
    privacyNoticeLink: "termo de privacidade",
    privacyNoticeSuffix: ".",
    privacyNoticeLinkAriaLabel: "Ler o termo de privacidade",
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

  it("deve renderizar o link de cadastro apontando para /signup", () => {
    vi.spyOn(viewModelModule, "useAuthVM").mockReturnValue(
      createMockVMReturn()
    );

    render(<AuthView />);

    const link = screen.getByRole("link", { name: "Cadastre-se" });
    expect(link.getAttribute("href")).toBe("/signup");
  });

  it("deve levar ao termo de privacidade pelo link do aviso, acessível pelo teclado", () => {
    vi.spyOn(viewModelModule, "useAuthVM").mockReturnValue(
      createMockVMReturn()
    );

    render(<AuthView />);

    const link = screen.getByRole("link", { name: "Ler o termo de privacidade" });
    expect(link.getAttribute("href")).toBe("/privacy-terms");
    expect(link.textContent).toBe("termo de privacidade");
    expect(link.closest("p")?.textContent).toBe(
      "Ao continuar você aceita nosso termo de privacidade."
    );
    link.focus();
    expect(document.activeElement).toBe(link);
  });

  it("não deve mostrar o Esqueceu sua senha?, sem fluxo de recuperação ainda", () => {
    vi.spyOn(viewModelModule, "useAuthVM").mockReturnValue(
      createMockVMReturn()
    );

    render(<AuthView />);

    expect(screen.queryByText(/esqueceu sua senha|esqueci minha senha/i)).toBeNull();
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Entrar"]);
  });

  it("deve falar em e-mail nos rótulos, nunca em usuário", () => {
    vi.spyOn(viewModelModule, "useAuthVM").mockReturnValue(
      createMockVMReturn()
    );

    render(<AuthView />);

    expect(screen.getByLabelText("E-MAIL").getAttribute("type")).toBe("email");
    expect(screen.queryByText(/usu[aá]rio/i)).toBeNull();
  });
});
