// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AdminUserDetailView } from "../index";
import * as viewModelModule from "../adminUserDetail.viewmodel";
import type { AdminUserDetailViewModelReturn, AdminUserDetailLabels } from "../adminUserDetail.types";
import { AppProviders } from "@/shared/providers";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "pt",
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/admin/usuarios/1",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("AdminUserDetailView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  const mockLabels: AdminUserDetailLabels = {
    backToList: "Voltar para usuários",
    statusActive: "Ativo",
    statusPending: "Pendente",
    statusInactive: "Inativo",
    statusActivate: "Ativar conta",
    statusDeactivate: "Desativar conta",
    accountActive: "Conta ativa",
    accountInactive: "Conta inativa",
    accountPending: "Conta pendente",
    toggleSuccess: "Situação alterada com sucesso.",
    bannerTitle: "Usuário Inativo",
    bannerDescription: "Esta conta está desativada.",
    bannerActivateNow: "Ativar agora",
    bannerDismiss: "Fechar",
    bannerDontShowAgain: "Não mostrar novamente",
    formTitle: "Dados do Usuário",
    formSubtitle: "Atualize as informações cadastrais.",
    formName: "Nome completo",
    formOrganization: "Órgão / Empresa",
    formEmployeeCode: "Código de funcionário",
    formEmail: "E-mail institucional",
    formDepartment: "Setor / Área",
    formRole: "Perfil de acesso",
    formRoleAdmin: "Administrador",
    formRoleManager: "Gestor",
    formRoleUser: "Usuário",
    formUnsavedChanges: "Você possui alterações não salvas neste formulário.",
    formCancel: "Cancelar",
    formSave: "Salvar alterações",
    formSaving: "Salvando...",
    formSaveSuccess: "Usuário atualizado com sucesso!",
    valNameRequired: "Nome é obrigatório.",
    valEmailRequired: "E-mail é obrigatório.",
    valEmailInvalid: "E-mail inválido.",
    valDepartmentRequired: "Setor é obrigatório.",
    valEmployeeCodeRequired: "Código é obrigatório.",
    journeysTitle: "Jornadas Realizadas",
    journeysSubtitle: "Trilhas concluídas.",
    journeysViewResult: "Ver resultado",
    journeysViewAllResults: "Ver todos os resultados deste usuário",
    journeysScore: (score) => `Nota: ${score}/100`,
    journeysCompletedAt: (date) => `Concluída em ${date}`,
    journeysEmptyTitle: "Nenhuma jornada realizada",
    journeysEmptyDescription: "Sem jornadas concluídas.",
    dangerZoneTitle: "Zona de Perigo",
    dangerZoneDescription: "A exclusão é definitiva.",
    dangerZoneDeleteButton: "Excluir usuário",
    modalTitle: "Excluir usuário permanentemente?",
    modalDescription: (name) => `Tem certeza de que deseja excluir ${name}?`,
    modalCancel: "Cancelar",
    modalConfirm: "Sim, excluir usuário",
    deleteSuccess: "Usuário excluído com sucesso.",
  };

  function createMockVMReturn(
    overrides?: Partial<AdminUserDetailViewModelReturn>
  ): AdminUserDetailViewModelReturn {
    return {
      user: {
        id: "1",
        name: "Ana Silva",
        email: "ana@empresa.com",
        initials: "AS",
        employeeCode: "EMP-1001",
        department: "TI",
        organization: "Secretaria de Governo",
        role: "admin",
        roleLabel: "Administrador",
        status: "active",
        journeysCount: 1,
        createdAt: "2026-01-01",
        journeys: [
          {
            id: "j1",
            title: "Fundamentos LGPD",
            domain: "privacy",
            domainLabel: "Privacidade",
            completedAt: "2026-03-01",
            score: 85,
          },
        ],
      },
      isLoading: false,
      isError: false,
      errorMessage: null,
      handleRetry: vi.fn(),

      isTogglingStatus: false,
      handleToggleStatus: vi.fn(),

      showInactiveBanner: false,
      handleDismissBanner: vi.fn(),
      handleDontShowAgain: vi.fn(),

      formData: {
        name: "Ana Silva",
        organization: "Secretaria de Governo",
        employeeCode: "EMP-1001",
        email: "ana@empresa.com",
        department: "TI",
        role: "admin",
      },
      formErrors: {},
      isDirty: false,
      isSaving: false,
      saveSuccessMessage: null,
      handleFieldChange: vi.fn(),
      handleResetForm: vi.fn(),
      handleSaveForm: vi.fn().mockResolvedValue(undefined),

      journeys: [
        {
          id: "j1",
          title: "Fundamentos LGPD",
          domain: "privacy",
          domainLabel: "Privacidade",
          completedAt: "2026-03-01",
          score: 85,
        },
      ],

      isDeleteModalOpen: false,
      isDeleting: false,
      handleOpenDeleteModal: vi.fn(),
      handleCloseDeleteModal: vi.fn(),
      handleConfirmDelete: vi.fn().mockResolvedValue(undefined),

      canDeleteUser: true,
      canManageRoles: true,
      canManageUser: true,

      labels: mockLabels,
      ...overrides,
    };
  }

  it("deve renderizar os dados do usuário, cabeçalho e formulário", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn()
    );

    render(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );

    expect(screen.getAllByText("Ana Silva").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Voltar para usuários")).toBeDefined();
    expect(screen.getByText("Conta ativa")).toBeDefined();
    expect(screen.getByText("Desativar conta")).toBeDefined();
    expect(screen.getByText("Dados do Usuário")).toBeDefined();
    expect(screen.getByDisplayValue("ana@empresa.com")).toBeDefined();
    expect(screen.getByText("Fundamentos LGPD")).toBeDefined();
    expect(screen.getByText("Zona de Perigo")).toBeDefined();
  });

  it("deve exibir banner de usuário inativo quando showInactiveBanner for true", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ showInactiveBanner: true })
    );

    render(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );

    expect(screen.getByText("Usuário Inativo")).toBeDefined();
    expect(screen.getByText("Ativar agora")).toBeDefined();
    expect(screen.getByText("Não mostrar novamente")).toBeDefined();
  });

  it("deve exibir aviso de alterações não salvas quando isDirty for true", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ isDirty: true })
    );

    render(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );

    expect(
      screen.getByText("Você possui alterações não salvas neste formulário.")
    ).toBeDefined();
  });

  it("deve abrir o modal de confirmação ao clicar em Excluir usuário", () => {
    const handleOpenDeleteModalMock = vi.fn();
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ handleOpenDeleteModal: handleOpenDeleteModalMock })
    );

    render(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );

    const deleteBtn = screen.getByRole("button", { name: "Excluir usuário" });
    fireEvent.click(deleteBtn);
    expect(handleOpenDeleteModalMock).toHaveBeenCalled();
  });

  it("deve exibir skeleton durante carregamento", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ isLoading: true, user: null })
    );

    render(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );

    expect(screen.getByTestId("user-detail-skeleton")).toBeDefined();
  });
});
