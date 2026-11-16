// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { AdminUserInviteView } from "../index";
import * as viewModelModule from "../adminUserInvite.viewmodel";
import type {
  AdminUserInviteLabels,
  AdminUserInviteViewModelReturn,
} from "../adminUserInvite.types";

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/layout/PageShell", () => ({
  PageShell: ({
    children,
    title,
  }: {
    children: ReactNode;
    title: string;
  }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

const mockLabels: AdminUserInviteLabels = {
  pageTitle: "Convidar usuário",
  pageSubtitle: "Envie um convite por e-mail.",
  backToList: "Voltar para usuários",
  summaryEmptyTitle: "Novo convite",
  summaryBadge: "Convite",
  formTitle: "Dados do convite",
  formSubtitle: "Informe o e-mail e o perfil.",
  emailLabel: "E-mail",
  emailPlaceholder: "colaborador@empresa.com",
  roleLabel: "Perfil de acesso",
  roleLockedHint: "Perfil fixado em Usuário.",
  infoNotice:
    "A pessoa receberá um e-mail com um link para definir a senha e completar os próprios dados. O link vale por 60 minutos e pode ser usado uma vez.",
  cancelButton: "Cancelar",
  submitButton: "Enviar convite",
  submittingButton: "Enviando convite...",
  profilesLoadError: "Não foi possível carregar os perfis de acesso.",
  retryButton: "Tentar novamente",
  errors: {
    emailRequired: "O e-mail é obrigatório.",
    emailInvalid: "Insira um endereço de e-mail válido.",
    accountAlreadyExists: "Já existe uma conta cadastrada com este e-mail.",
    genericSubmit: "Não foi possível enviar o convite. Tente novamente.",
    permissionDenied: "Você não tem permissão para realizar esta ação.",
    tooManyAttempts: "Muitas tentativas. Aguarde um pouco e tente de novo.",
    validation: "Revise os dados do convite.",
  },
};

function makeViewModel(
  overrides: Partial<AdminUserInviteViewModelReturn> = {}
): AdminUserInviteViewModelReturn {
  return {
    email: "",
    profileTypeId: 3,
    summaryTitle: "Novo convite",
    summaryRoleLabel: "Usuário",
    roleOptions: [
      { value: 3, label: "Usuário" },
      { value: 2, label: "Gestor" },
      { value: 1, label: "Administrador" },
    ],
    canChangeProfile: true,
    isProfilesLoading: false,
    isProfilesError: false,
    emailError: null,
    roleError: null,
    submitError: null,
    isSubmitting: false,
    backHref: "/admin/usuarios",
    labels: mockLabels,
    handleEmailChange: vi.fn(),
    handleRoleChange: vi.fn(),
    handleRetryProfiles: vi.fn(),
    handleCancel: vi.fn(),
    handleSubmit: vi.fn(async (e) => {
      e.preventDefault();
    }),
    ...overrides,
  };
}

describe("AdminUserInviteView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza resumo dinâmico, nota explicativa e ações principais", () => {
    vi.spyOn(viewModelModule, "useAdminUserInviteVM").mockReturnValue(
      makeViewModel()
    );

    render(<AdminUserInviteView />);

    expect(screen.getByText("Novo convite")).toBeTruthy();
    expect(
      screen.getByText(
        "A pessoa receberá um e-mail com um link para definir a senha e completar os próprios dados. O link vale por 60 minutos e pode ser usado uma vez."
      )
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Enviar convite" })
    ).toBeTruthy();
    expect(screen.getByText("Voltar para usuários").closest("a")?.getAttribute("href")).toBe(
      "/admin/usuarios"
    );
  });

  it("atualiza card de resumo com e-mail e perfil selecionados e trava select sem permissão", () => {
    vi.spyOn(viewModelModule, "useAdminUserInviteVM").mockReturnValue(
      makeViewModel({
        email: "pessoa@empresa.com",
        summaryTitle: "pessoa@empresa.com",
        summaryRoleLabel: "Usuário",
        canChangeProfile: false,
      })
    );

    render(<AdminUserInviteView />);

    expect(screen.getByRole("heading", { level: 2, name: "pessoa@empresa.com" })).toBeTruthy();
    const roleSelect = screen.getByLabelText(/Perfil de acesso/);
    expect(roleSelect).toHaveProperty("disabled", true);
    expect(screen.getByText("Perfil fixado em Usuário.")).toBeTruthy();
  });

  it("exibe erro no campo de e-mail, alerta genérico e estado de carregamento no envio", () => {
    const handleCancel = vi.fn();
    vi.spyOn(viewModelModule, "useAdminUserInviteVM").mockReturnValue(
      makeViewModel({
        emailError: "Já existe uma conta cadastrada com este e-mail.",
        submitError: "Não foi possível enviar o convite. Tente novamente.",
        isSubmitting: true,
        handleCancel,
      })
    );

    render(<AdminUserInviteView />);

    expect(
      screen.getByLabelText(/E-mail/).getAttribute("aria-invalid")
    ).toBe("true");
    expect(
      screen.getByText("Já existe uma conta cadastrada com este e-mail.")
    ).toBeTruthy();
    expect(
      screen.getByText("Não foi possível enviar o convite. Tente novamente.")
    ).toBeTruthy();

    const submitButton = screen.getByRole("button", {
      name: "Enviando convite...",
    });
    expect(submitButton).toHaveProperty("disabled", true);
    expect(submitButton.getAttribute("aria-busy")).toBe("true");
  });

  it("aciona cancelar ao clicar no botão Cancelar", () => {
    const handleCancel = vi.fn();
    vi.spyOn(viewModelModule, "useAdminUserInviteVM").mockReturnValue(
      makeViewModel({ handleCancel })
    );

    render(<AdminUserInviteView />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(handleCancel).toHaveBeenCalledOnce();
  });

  it("mostra o erro do perfil, o aviso de perfis indisponíveis e usa o link com os filtros", () => {
    const handleRetryProfiles = vi.fn();
    const handleRoleChange = vi.fn();
    vi.spyOn(viewModelModule, "useAdminUserInviteVM").mockReturnValue(
      makeViewModel({
        roleError: "Informe um perfil de acesso valido.",
        isProfilesError: true,
        backHref: "/admin/usuarios?status=pending",
        handleRetryProfiles,
        handleRoleChange,
      })
    );

    render(<AdminUserInviteView />);

    expect(screen.getByText("Informe um perfil de acesso valido.")).toBeTruthy();
    expect(screen.getByText(/Não foi possível carregar os perfis de acesso/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(handleRetryProfiles).toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Perfil de acesso/), { target: { value: "2" } });
    expect(handleRoleChange).toHaveBeenCalledWith(2);
    expect(screen.getByText("Voltar para usuários").closest("a")?.getAttribute("href")).toBe(
      "/admin/usuarios?status=pending"
    );
  });
});
