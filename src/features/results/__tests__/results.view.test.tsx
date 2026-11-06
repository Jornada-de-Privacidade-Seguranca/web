// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ResultsView } from "../index";
import * as viewModelModule from "../results.viewmodel";
import type { ResultsViewModelReturn, ResultsLabels } from "../results.types";
import { AppProviders } from "@/shared/providers";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "pt",
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "pt" }),
}));

// Mock i18n navigation helpers
vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/results",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("ResultsView Component", () => {
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

  function renderView() {
    return render(
      <AppProviders>
        <ResultsView />
      </AppProviders>
    );
  }

  const mockLabels: ResultsLabels = {
    title: "Resultados",
    subtitle: "Todas as jornadas que você já concluiu.",
    kpiTotalCompleted: "Jornadas concluídas",
    kpiAverageScore: "Média geral",
    kpiDomainScore: (score: number) => `${score}/100`,
    kpiEmptyScore: "—",
    sectionTitle: "Jornadas concluídas",
    sectionSubtitle: "Revise os resultados das jornadas que você já finalizou.",
    searchPlaceholder: "Buscar pelo nome do perfil...",
    searchEmptyTitle: "Nenhum resultado encontrado",
    searchEmpty: "Nenhum resultado corresponde à busca ou aos filtros aplicados.",
    userEmptyTitle: "Você ainda não concluiu nenhuma jornada",
    userEmpty: "Complete uma jornada para acompanhar seus resultados e sua evolução aqui.",
    availableJourneysCta: "Ver jornadas disponíveis",
    completedAt: (dateStr: string) => `Concluída em ${dateStr}`,
    completedScoreTag: (score: number) => `Concluída · ${score}/100`,
    questionsCount: (count: number) => `${count} perguntas`,
    viewResult: "Ver resultado",
    filtersButton: "Filtros",
    filtersButtonWithCount: (count: number) => `Filtros (${count})`,
    filtersTitle: "Filtros de busca",
    filtersDomainTitle: "Domínio",
    filtersClear: "Limpar filtros",
    filterDomainPrivacy: "Privacidade",
    filterDomainSecurity: "Segurança da Informação",
    filterDomainJoint: "Conjunta",
    paginationPrevious: "Anterior",
    paginationNext: "Próxima",
    paginationPageOf: (current: number, total: number) =>
      `Página ${current} de ${total}`,
    errorTitle: "Erro ao carregar resultados",
    errorMetricsMessage: "Erro ao carregar estatísticas de resultados.",
    errorMessage: "Não foi possível carregar os resultados das jornadas.",
    retryButton: "Tentar novamente",
    loadingAriaLabel: "Carregando resultados de jornadas",
    scoreAriaLabel: (score: number) => `Nota: ${score} de 100`,
  };

  function createMockVMReturn(
    overrides?: Partial<ResultsViewModelReturn>
  ): ResultsViewModelReturn {
    return {
      metrics: {
        totalCompleted: 15,
        averageScore: 76,
        domainMetrics: [
          { domain: "privacy", label: "Privacidade", averageScore: 84 },
          { domain: "security", label: "Segurança da Informação", averageScore: 60 },
          { domain: "joint", label: "Conjunta", averageScore: null },
        ],
      },
      isMetricsLoading: false,
      isMetricsError: false,

      results: [
        {
          id: "r1",
          title: "Fundamentos de LGPD",
          score: 78,
          completedAt: "2026-05-20",
          domain: "privacy",
          domainLabel: "Privacidade",
        },
      ],
      page: 1,
      totalPages: 1,
      isResultsLoading: false,
      isResultsError: false,
      resultsErrorMessage: null,
      emptyState: "none",

      searchTerm: "",
      handleSearchChange: vi.fn(),
      handlePageChange: vi.fn(),

      isFilterPanelOpen: false,
      handleToggleFilterPanel: vi.fn(),
      activeFiltersCount: 0,
      filters: { domains: [] },
      handleToggleDomainFilter: vi.fn(),
      handleClearFilters: vi.fn(),

      isLoading: false,
      error: null,
      serverMessage: null,
      onCloseMsg: vi.fn(),
      handleRetry: vi.fn(),
      labels: mockLabels,
      ...overrides,
    };
  }

  it("deve renderizar o painel de KPIs dinâmico por domínio e os cards da lista de resultados", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn()
    );

    renderView();

    expect(screen.getAllByText("Jornadas concluídas").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("15")).toBeDefined();
    expect(screen.getAllByText("Privacidade").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("84/100")).toBeDefined();
    expect(screen.getByText("Segurança da Informação")).toBeDefined();
    expect(screen.getByText("60/100")).toBeDefined();
    expect(screen.getByText("Conjunta")).toBeDefined();
    expect(screen.getByText("—")).toBeDefined();

    expect(screen.getByText("Fundamentos de LGPD")).toBeDefined();
    expect(screen.getByText("Concluída · 78/100")).toBeDefined();
    expect(screen.getByText("Ver resultado")).toBeDefined();
  });

  it("deve exibir a tag de nota e o botão de resultado com acessibilidade", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        results: [
          {
            id: "r1",
            title: "Alta",
            score: 78,
            completedAt: "2026-05-20",
            domain: "privacy",
          },
        ],
      })
    );

    renderView();

    const scoreTag = screen.getByTestId("result-score-tag");
    expect(scoreTag.getAttribute("aria-label")).toBe("Nota: 78 de 100");
    expect(scoreTag.textContent).toContain("Concluída · 78/100");

    // Não deve exibir perguntas nem descrição
    expect(screen.queryByText(/perguntas/i)).toBeNull();
  });

  it("deve abrir o painel de filtros ao clicar no botão Filtros e acionar handlers", () => {
    const handleToggleFilterPanelMock = vi.fn();
    const handleToggleDomainFilterMock = vi.fn();

    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        isFilterPanelOpen: true,
        handleToggleFilterPanel: handleToggleFilterPanelMock,
        handleToggleDomainFilter: handleToggleDomainFilterMock,
      })
    );

    renderView();

    const filterButton = screen.getByRole("button", { name: "Filtros" });
    fireEvent.click(filterButton);
    expect(handleToggleFilterPanelMock).toHaveBeenCalled();

    // No painel de filtros aberto, clicar na opção Privacidade
    const privacyChip = screen.getByRole("button", { name: "Privacidade" });
    fireEvent.click(privacyChip);
    expect(handleToggleDomainFilterMock).toHaveBeenCalledWith("privacy");
  });

  it("deve exibir Skeletons durante o carregamento dos dados", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        isMetricsLoading: true,
        isResultsLoading: true,
        results: [],
      })
    );

    renderView();

    const skeletons = screen.getByTestId("results-skeleton");
    expect(skeletons).toBeDefined();
  });

  it("deve exibir erro pontual e retry nos cards de KPI quando isMetricsError for true", () => {
    const handleRetryMock = vi.fn();
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        isMetricsError: true,
        metrics: null,
        handleRetry: handleRetryMock,
      })
    );

    renderView();

    expect(
      screen.getByText("Erro ao carregar estatísticas de resultados.")
    ).toBeDefined();

    fireEvent.click(screen.getAllByText("Tentar novamente")[0]);
    expect(handleRetryMock).toHaveBeenCalled();
  });

  it("deve exibir a mensagem de erro específica da listagem quando isResultsError for true", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        isResultsError: true,
        resultsErrorMessage: "Falha ao carregar a listagem de resultados.",
        results: [],
        serverMessage: {
          title: "Erro ao carregar resultados",
          description: "Falha ao carregar as estatísticas de resultados.",
          variant: "destructive",
        },
      })
    );

    renderView();

    expect(
      screen.getByText("Falha ao carregar a listagem de resultados.")
    ).toBeDefined();
    expect(
      screen.getByText("Falha ao carregar as estatísticas de resultados.")
    ).toBeDefined();
  });

  it("deve renderizar o ResultsEmptyState com o botão CTA levando a /jornadas quando emptyState = 'no-results'", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        results: [],
        emptyState: "no-results",
      })
    );

    renderView();

    expect(
      screen.getByText("Você ainda não concluiu nenhuma jornada")
    ).toBeDefined();
    expect(
      screen.getByText(
        "Complete uma jornada para acompanhar seus resultados e sua evolução aqui."
      )
    ).toBeDefined();

    const ctaButton = screen.getByText("Ver jornadas disponíveis").closest("a");
    expect(ctaButton).toBeDefined();
    expect(ctaButton?.getAttribute("href")).toBe("/jornadas");
  });

  it("deve acionar handleSearchChange ao digitar no input de busca", () => {
    const handleSearchChangeMock = vi.fn();
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({ handleSearchChange: handleSearchChangeMock })
    );

    renderView();

    const searchInput = screen.getByPlaceholderText(
      "Buscar pelo nome do perfil..."
    );
    fireEvent.change(searchInput, { target: { value: "LGPD" } });

    expect(handleSearchChangeMock).toHaveBeenCalledWith("LGPD");
  });
});
