// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AssessmentsView } from "../index";
import * as viewModelModule from "../assessments.viewmodel";
import type { AssessmentsViewModelReturn, AssessmentsLabels } from "../assessments.types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/layout/PageShell", () => ({
  PageShell: ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="page-shell">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <main>{children}</main>
    </div>
  ),
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockLabels: AssessmentsLabels = {
  title: "Jornadas de Aprendizado",
  subtitle: "Acesse suas trilhas de conhecimento e jornadas de privacidade e segurança.",
  pendingSectionTitle: "Jornada em andamento",
  pendingSectionSubtitle: "Jornada disponível para você responder.",
  pendingEmpty: "Você não possui nenhuma jornada pendente no momento.",
  catalogSectionTitle: "Todas as jornadas",
  catalogSectionSubtitle: "Escolha qualquer jornada disponível para responder.",
  catalogSearchPlaceholder: "Buscar jornada pelo nome...",
  catalogEmpty: "Nenhuma jornada encontrada para os filtros selecionados.",
  statusCompleted: "Concluída",
  statusInProgress: "Pendente",
  statusNotStarted: "Não realizada",
  actionStart: "Iniciar jornada",
  actionContinue: "Continuar jornada",
  actionRetake: "Refazer jornada",
  actionCancel: "Cancelar jornada",
  assignedBadge: "Atribuída",
  inProgressBadge: "Em andamento",
  assignedBy: (name: string) => `Atribuída por ${name}`,
  onlyAssignerCanCancel: "Apenas quem atribuiu pode cancelar.",
  completedScoreBadge: (score) => `Concluída · ${score}/100`,
  competenciesCount: (count) => `${count} competências`,
  questionsCount: (count) => `${count} perguntas`,
  estimatedMinutes: (minutes) => `${minutes} min`,
  filtersButton: "Filtros",
  filtersButtonWithCount: (count) => `Filtros (${count})`,
  filtersPanelTitle: "Filtrar jornadas",
  filtersClear: "Limpar filtros",
  filterDomainTitle: "Domínio",
  filterDomainPrivacy: "Privacidade",
  filterDomainSecurity: "Segurança da Informação",
  filterDomainJoint: "Conjunta",
  filterStatusTitle: "Situação",
  filterStatusCompleted: "Concluída",
  filterStatusNotStarted: "Não realizada",
  filterStatusInProgress: "Pendente",
  cancelModalTitle: "Cancelar jornada",
  cancelModalDescription: "Tem certeza de que deseja cancelar esta jornada? Suas respostas até aqui não serão salvas.",
  cancelModalKeep: "Manter jornada",
  cancelModalConfirm: "Cancelar jornada",
  cancelModalConfirming: "Cancelando...",
  cancelSuccess: "Jornada cancelada.",
  cancelError: "Não foi possível cancelar a jornada.",
  cancelNotAllowed: "Esta jornada não pode mais ser cancelada.",
  cancelUnavailable: "Esta jornada não está mais disponível.",
  closeMessage: "Fechar aviso",
  paginationPrevious: "Anterior",
  paginationNext: "Próximo",
  paginationPageOf: (c, t) => `Página ${c} de ${t}`,
  errorTitle: "Erro",
  errorMessage: "Erro ao carregar dados.",
  retryButton: "Tentar novamente",
  loadingAriaLabel: "Carregando",
};

const mockBaseReturn: AssessmentsViewModelReturn = {
  pendingJourney: {
    id: "p1",
    title: "Segurança na Nuvem",
    description: "Fundamentos de nuvem segura",
    domain: "security",
    competenciesCount: 15,
    estimatedMinutes: 20,
    status: "in_progress",
    isSelfStarted: true,
    origin: "self_started",
  },
  hasPendingJourney: true,
  isPendingLoading: false,
  pendingError: null,
  handleRetryPending: vi.fn(),

  isCancelModalOpen: false,
  isCancellingJourney: false,
  cancelErrorMessage: null,
  cancelSuccessMessage: null,
  handleDismissCancelSuccess: vi.fn(),
  handleOpenCancelModal: vi.fn(),
  handleCloseCancelModal: vi.fn(),
  handleConfirmCancelJourney: vi.fn(),

  catalogJourneys: [
    {
      id: "1",
      title: "LGPD para Desenvolvedores",
      description: "Práticas de desenvolvimento seguro",
      domain: "privacy",
      competenciesCount: 10,
      estimatedMinutes: 15,
      status: "not_started",
      href: "/jornada/perfil/1",
    },
    {
      id: "2",
      title: "Governança Corporativa",
      description: "Trilha corporativa concluída",
      domain: "joint",
      competenciesCount: 12,
      estimatedMinutes: 18,
      status: "completed",
      score: 88,
      href: "/jornada/2",
    },
  ],
  catalogPage: 1,
  catalogTotalPages: 1,
  catalogTotalItems: 2,
  isCatalogLoading: false,
  catalogError: null,
  searchTerm: "",
  handleSearchChange: vi.fn(),
  handleCatalogPageChange: vi.fn(),
  handleRetryCatalog: vi.fn(),
  catalogPageError: null,
  dismissCatalogPageError: vi.fn(),

  isFilterPanelOpen: false,
  handleToggleFilterPanel: vi.fn(),
  activeFiltersCount: 0,
  filters: { domains: [], statuses: [] },
  handleToggleDomainFilter: vi.fn(),
  handleToggleStatusFilter: vi.fn(),
  handleClearFilters: vi.fn(),

  labels: mockLabels,
};

describe("AssessmentsView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar jornada pendente em destaque no singular e catálogo de jornadas", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(mockBaseReturn);

    render(<AssessmentsView />);

    expect(screen.getByText("Jornada em andamento")).toBeDefined();
    expect(screen.getByText("Segurança na Nuvem")).toBeDefined();
    expect(screen.getByText("Todas as jornadas")).toBeDefined();
    expect(screen.getByText("LGPD para Desenvolvedores")).toBeDefined();
    expect(screen.getByText("Governança Corporativa")).toBeDefined();
    expect(screen.getByText("Concluída · 88/100")).toBeDefined();
  });

  it("NÃO deve renderizar a seção de jornada pendente quando não houver jornada ativa", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue({
      ...mockBaseReturn,
      pendingJourney: null,
      hasPendingJourney: false,
    });

    render(<AssessmentsView />);

    expect(screen.queryByText("Jornada em andamento")).toBeNull();
    expect(screen.queryByText("Segurança na Nuvem")).toBeNull();
    expect(screen.getByText("Todas as jornadas")).toBeDefined();
  });

  it("deve abrir o modal de confirmação ao clicar em Cancelar jornada", () => {
    const handleOpenCancelMock = vi.fn();
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue({
      ...mockBaseReturn,
      handleOpenCancelModal: handleOpenCancelMock,
    });

    render(<AssessmentsView />);

    const cancelBtn = screen.getByRole("button", { name: /Cancelar jornada/i });
    fireEvent.click(cancelBtn);

    expect(handleOpenCancelMock).toHaveBeenCalledTimes(1);
  });

  it("deve alternar o painel de filtros ao clicar no botão Filtros", () => {
    const handleToggleFilterPanelMock = vi.fn();
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue({
      ...mockBaseReturn,
      handleToggleFilterPanel: handleToggleFilterPanelMock,
    });

    render(<AssessmentsView />);

    const filterBtn = screen.getByRole("button", { name: "Filtros" });
    fireEvent.click(filterBtn);

    expect(handleToggleFilterPanelMock).toHaveBeenCalledTimes(1);
  });

  it("deve exibir EmptyState quando não houver jornadas no catálogo", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue({
      ...mockBaseReturn,
      catalogJourneys: [],
    });

    render(<AssessmentsView />);

    expect(
      screen.getByText("Nenhuma jornada encontrada para os filtros selecionados.")
    ).toBeDefined();
  });
});
