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
    valNameSurname: "Informe nome e sobrenome.",
    valOrganizationRequired: "Órgão obrigatório",
    valMaxLength: (max: number) => `Máximo ${max}`,
    deleting: "Excluindo...",
    loadErrorMessage: "Erro ao carregar o usuário",
    retryButton: "Tentar novamente",
    notFoundTitle: "Usuário não encontrado",
    notFoundDescription: "Este usuário não existe ou foi excluído.",
    closeMessage: "Fechar aviso",
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
        profileTypeId: 1,
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
      isNotFound: false,
      errorMessage: null,
      handleRetry: vi.fn(),
      backHref: "/admin/usuarios?page=2",

      isTogglingStatus: false,
      handleToggleStatus: vi.fn(),
      statusMessage: null,
      handleDismissStatusMessage: vi.fn(),

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
      saveErrorMessage: null,
      handleFieldChange: vi.fn(),
      handleResetForm: vi.fn(),
      handleSaveForm: vi.fn().mockResolvedValue(undefined),

      activeJourney: null,
      assignableOptions: [
        {
          id: 1,
          name: "Encarregado pelo Tratamento de Dados Pessoais",
          domain: "privacy",
          domainLabel: "Privacidade",
        },
        {
          id: 2,
          name: "Gestor de Segurança da Informação",
          domain: "security",
          domainLabel: "Segurança da Informação",
        },
      ],
      isFirstJourney: false,
      isInitialProfileRequired: false,
      selectedProfileId: 1,
      isAssignModalOpen: false,
      isAssigningJourney: false,
      assignErrorMessage: null,
      isCancelAssignModalOpen: false,
      isCancellingAssignment: false,
      cancelErrorMessage: null,
      journeySuccessMessage: null,
      canAssignJourney: true,
      canCancelAssignment: false,
      handleOpenAssignModal: vi.fn(),
      handleCloseAssignModal: vi.fn(),
      handleSelectProfile: vi.fn(),
      handleConfirmAssignJourney: vi.fn().mockResolvedValue(undefined),
      handleOpenCancelAssignModal: vi.fn(),
      handleCloseCancelAssignModal: vi.fn(),
      handleConfirmCancelAssignment: vi.fn().mockResolvedValue(undefined),
      handleDismissJourneyMessage: vi.fn(),
      activeJourneyLabels: {
        title: "Jornada em andamento",
        subtitle: "Acompanhe a trilha ativa.",
        emptyTitle: "Nenhuma jornada em andamento",
        emptyDescription: "Este usuário não possui nenhuma jornada ativa.",
        startedAt: (date) => `Iniciada em ${date}`,
        originSelf: "Iniciada pelo usuário",
        originAssigned: (name) => `Atribuída por ${name}`,
        assignButton: "Atribuir jornada",
        alreadyActiveHint: "Este usuário já tem uma jornada em andamento",
        cancelButton: "Cancelar atribuição",
        closeMessage: "Fechar aviso",
        domains: {
          privacy: "Privacidade",
          security: "Segurança da Informação",
          joint: "Conjunta",
        },
      },
      assignJourneyLabels: {
        modalTitle: "Atribuir jornada",
        modalDescription: "Selecione um perfil de jornada.",
        firstJourneyNotice:
          "A primeira jornada deve ser do perfil escolhido pelo usuário",
        selectionRequiredNotice:
          "Este usuário ainda não escolheu o perfil de jornada inicial.",
        cancel: "Cancelar",
        confirm: "Atribuir",
        submitting: "Atribuindo...",
        emptyOptions: "Nenhum perfil de jornada disponível.",
      },
      cancelAssignmentLabels: {
        modalTitle: "Cancelar atribuição de jornada?",
        modalDescription: (title) => `Cancelar ${title}?`,
        keepButton: "Manter jornada",
        confirmButton: "Cancelar atribuição",
        cancellingButton: "Cancelando...",
      },

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
      deleteErrorMessage: null,
      handleOpenDeleteModal: vi.fn(),
      handleCloseDeleteModal: vi.fn(),
      handleConfirmDelete: vi.fn().mockResolvedValue(undefined),

      canDeleteUser: true,
      canManageRoles: true,
      canManageUser: true,
      canToggleStatus: true,

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

  it("posiciona Jornada em andamento acima de Jornadas Realizadas e exibe estado vazio com botão Atribuir jornada condicionado à permissão", () => {
    const handleOpenAssignModal = vi.fn();
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ handleOpenAssignModal })
    );

    const { rerender } = render(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );

    const activeHeading = screen.getByRole("heading", {
      level: 2,
      name: "Jornada em andamento",
    });
    const completedHeading = screen.getByRole("heading", {
      level: 2,
      name: "Jornadas Realizadas",
    });
    expect(
      Boolean(
        activeHeading.compareDocumentPosition(completedHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);

    expect(screen.getByText("Nenhuma jornada em andamento")).toBeDefined();
    const assignBtn = screen.getByRole("button", { name: "Atribuir jornada" });
    expect(assignBtn).toHaveProperty("disabled", false);
    fireEvent.click(assignBtn);
    expect(handleOpenAssignModal).toHaveBeenCalledOnce();

    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ canAssignJourney: false })
    );
    rerender(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );
    expect(screen.queryByRole("button", { name: "Atribuir jornada" })).toBeNull();
  });

  it("cobre os cenários de jornada em andamento: atribuída por mim, atribuída por outro e iniciada pelo usuário", () => {
    const handleOpenCancelAssignModal = vi.fn();
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        activeJourney: {
          id: "aj-1",
          profileId: 2,
          title: "Gestor de Segurança da Informação",
          domain: "security",
          domainLabel: "Segurança da Informação",
          startedAt: "2026-06-01T10:00:00Z",
          origin: "assigned",
          assignedBy: { id: 1, name: "Usuário Teste" },
          assigned_by: { id: 1, name: "Usuário Teste" },
        },
        canCancelAssignment: true,
        handleOpenCancelAssignModal,
      })
    );

    const { rerender } = render(
      <AppProviders>
        <AdminUserDetailView userId="2" />
      </AppProviders>
    );

    expect(screen.getByText("Atribuída por Usuário Teste")).toBeDefined();
    expect(
      screen.getByText("Este usuário já tem uma jornada em andamento")
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Atribuir jornada" })
    ).toHaveProperty("disabled", true);

    const cancelAssignBtn = screen.getByRole("button", {
      name: "Cancelar atribuição",
    });
    fireEvent.click(cancelAssignBtn);
    expect(handleOpenCancelAssignModal).toHaveBeenCalledOnce();

    // Atribuída por outro admin -> sem botão Cancelar atribuição
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        activeJourney: {
          id: "aj-2",
          profileId: 4,
          title: "Operador",
          domain: "privacy",
          domainLabel: "Privacidade",
          startedAt: "2026-06-02T10:00:00Z",
          origin: "assigned",
          assignedBy: { id: 99, name: "Roberto Almeida" },
          assigned_by: { id: 99, name: "Roberto Almeida" },
        },
        canCancelAssignment: false,
      })
    );
    rerender(
      <AppProviders>
        <AdminUserDetailView userId="3" />
      </AppProviders>
    );
    expect(screen.getByText("Atribuída por Roberto Almeida")).toBeDefined();
    expect(
      screen.queryByRole("button", { name: "Cancelar atribuição" })
    ).toBeNull();

    // Iniciada pelo usuário -> origem "Iniciada pelo usuário" e sem botão Cancelar atribuição
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        activeJourney: {
          id: "aj-3",
          profileId: 3,
          title: "Controlador",
          domain: "privacy",
          domainLabel: "Privacidade",
          startedAt: "2026-06-03T10:00:00Z",
          origin: "self_started",
          assignedBy: null,
          assigned_by: null,
        },
        canCancelAssignment: false,
      })
    );
    rerender(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );
    expect(screen.getByText("Iniciada pelo usuário")).toBeDefined();
    expect(
      screen.queryByRole("button", { name: "Cancelar atribuição" })
    ).toBeNull();
  });

  it("renderiza modal de atribuição com aviso de primeira jornada e modal de confirmação de cancelamento", () => {
    const handleConfirmAssignJourney = vi.fn().mockResolvedValue(undefined);
    const handleCloseAssignModal = vi.fn();
    const handleCloseCancelAssignModal = vi.fn();
    const handleConfirmCancelAssignment = vi.fn().mockResolvedValue(undefined);

    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        isFirstJourney: true,
        isAssignModalOpen: true,
        assignableOptions: [
          {
            id: 1,
            name: "Encarregado pelo Tratamento de Dados Pessoais",
            domain: "privacy",
            domainLabel: "Privacidade",
          },
        ],
        selectedProfileId: 1,
        handleConfirmAssignJourney,
        handleCloseAssignModal,
      })
    );

    const { rerender } = render(
      <AppProviders>
        <AdminUserDetailView userId="4" />
      </AppProviders>
    );

    expect(
      screen.getByText(
        "A primeira jornada deve ser do perfil escolhido pelo usuário"
      )
    ).toBeDefined();
    expect(
      screen.getByRole("radio", {
        name: /Encarregado pelo Tratamento de Dados Pessoais/,
      })
    ).toHaveProperty("checked", true);

    fireEvent.click(screen.getByRole("button", { name: "Atribuir" }));
    expect(handleConfirmAssignJourney).toHaveBeenCalledOnce();

    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        activeJourney: {
          id: "aj-1",
          profileId: 2,
          title: "Gestor de Segurança da Informação",
          domain: "security",
          domainLabel: "Segurança da Informação",
          startedAt: "2026-06-01T10:00:00Z",
          origin: "assigned",
          assignedBy: { id: 1, name: "Usuário Teste" },
          assigned_by: { id: 1, name: "Usuário Teste" },
        },
        canCancelAssignment: true,
        isCancelAssignModalOpen: true,
        handleCloseCancelAssignModal,
        handleConfirmCancelAssignment,
      })
    );

    rerender(
      <AppProviders>
        <AdminUserDetailView userId="2" />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Manter jornada" }));
    expect(handleCloseCancelAssignModal).toHaveBeenCalledOnce();

    const modalCancelBtns = screen.getAllByRole("button", {
      name: "Cancelar atribuição",
    });
    fireEvent.click(modalCancelBtns[modalCancelBtns.length - 1]);
    expect(handleConfirmCancelAssignment).toHaveBeenCalledOnce();
  });

  it("avisa que o usuário precisa escolher o perfil inicial e desabilita o Atribuir", () => {
    const handleConfirmAssignJourney = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        isFirstJourney: true,
        isInitialProfileRequired: true,
        isAssignModalOpen: true,
        assignableOptions: [],
        selectedProfileId: null,
        handleConfirmAssignJourney,
      })
    );

    render(
      <AppProviders>
        <AdminUserDetailView userId="4" />
      </AppProviders>
    );

    expect(
      screen.getByText("Este usuário ainda não escolheu o perfil de jornada inicial.")
    ).toBeDefined();
    expect(screen.queryByText("Nenhum perfil de jornada disponível.")).toBeNull();
    const confirm = screen.getByRole("button", { name: "Atribuir" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
  });

  it("renderiza mensagens de erro nos modais de atribuição e cancelamento quando presentes", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        isAssignModalOpen: true,
        assignErrorMessage: "Erro ao tentar atribuir jornada",
        assignableOptions: [],
      })
    );

    const { rerender } = render(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );

    expect(screen.getByText("Erro ao tentar atribuir jornada")).toBeDefined();
    expect(
      screen.getByText("Nenhum perfil de jornada disponível.")
    ).toBeDefined();

    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        activeJourney: {
          id: "aj-1",
          profileId: 2,
          title: "Gestor SI",
          domain: "security",
          domainLabel: "Segurança da Informação",
          startedAt: "2026-06-01T10:00:00Z",
          origin: "assigned",
          assignedBy: { id: 1, name: "Usuário Teste" },
        },
        canCancelAssignment: true,
        isCancelAssignModalOpen: true,
        cancelErrorMessage: "Erro ao tentar cancelar atribuição",
      })
    );

    rerender(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );

    expect(screen.getByText("Erro ao tentar cancelar atribuição")).toBeDefined();
  });

  function renderView() {
    render(
      <AppProviders>
        <AdminUserDetailView userId="1" />
      </AppProviders>
    );
  }

  it("mostra o estado de não encontrado com o link de volta à listagem", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ user: null, isError: true, isNotFound: true })
    );
    renderView();

    expect(screen.getByTestId("user-detail-not-found")).toBeDefined();
    expect(screen.getAllByText("Usuário não encontrado").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Voltar para usuários").closest("a")?.getAttribute("href")).toBe(
      "/admin/usuarios?page=2"
    );
  });

  it("mostra erro de carregamento com Tentar novamente", () => {
    const handleRetry = vi.fn();
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ user: null, isError: true, errorMessage: "Erro ao carregar o usuário", handleRetry })
    );
    renderView();

    expect(screen.getByText("Erro ao carregar o usuário")).toBeDefined();
    fireEvent.click(screen.getByText("Tentar novamente"));
    expect(handleRetry).toHaveBeenCalled();
  });

  it("o Voltar do cabeçalho mantém os filtros da listagem", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(createMockVMReturn());
    renderView();

    expect(screen.getByText("Voltar para usuários").closest("a")?.getAttribute("href")).toBe(
      "/admin/usuarios?page=2"
    );
  });

  it("mostra o aviso da ativação, o erro do salvar e o erro da exclusão", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({
        statusMessage: { variant: "destructive", text: "Você não pode desativar a sua própria conta." },
        saveErrorMessage: "Revise os campos destacados.",
        formErrors: { role: "O sistema precisa manter ao menos um administrador ativo." },
        isDeleteModalOpen: true,
        deleteErrorMessage: "Não foi possível excluir o usuário.",
      })
    );
    renderView();

    expect(screen.getByText("Você não pode desativar a sua própria conta.")).toBeDefined();
    expect(screen.getByText("Revise os campos destacados.")).toBeDefined();
    expect(
      screen.getByText("O sistema precisa manter ao menos um administrador ativo.")
    ).toBeDefined();
    expect(screen.getByText("Não foi possível excluir o usuário.")).toBeDefined();
  });

  it("esconde o botão de ativação sem permissão para isso", () => {
    vi.spyOn(viewModelModule, "useAdminUserDetailVM").mockReturnValue(
      createMockVMReturn({ canToggleStatus: false })
    );
    renderView();

    expect(screen.queryByText("Desativar conta")).toBeNull();
  });
});
