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
    kpiTotalCompleted: "JORNADAS CONCLUÍDAS",
    kpiAverageScore: "MÉDIA DAS NOTAS",
    sectionTitle: "Jornadas concluídas",
    sectionSubtitle: "Revise os resultados das jornadas que você já finalizou.",
    searchPlaceholder: "Buscar jornada pelo nome...",
    searchEmptyTitle: "Nenhum resultado encontrado",
    searchEmpty: "Nenhum resultado encontrado para o termo buscado.",
    userEmptyTitle: "Nenhuma jornada concluída",
    userEmpty: "Você ainda não concluiu nenhuma jornada. Seus resultados aparecerão aqui.",
    availableJourneysCta: "Ver jornadas disponíveis",
    completedAt: (dateStr: string) => `Concluída em ${dateStr}`,
    questionsCount: (count: number) => `${count} perguntas`,
    viewResult: "Ver resultado",
    paginationPrevious: "Anterior",
    paginationNext: "Próximo",
    paginationPageOf: (current: number, total: number) =>
      `Página ${current} de ${total}`,
    errorTitle: "Erro ao carregar resultados",
    errorMetricsMessage: "Erro ao carregar estatísticas de resultados.",
    errorMessage: "Não foi possível carregar os resultados das avaliações.",
    retryButton: "Tentar novamente",
    loadingAriaLabel: "Carregando resultados de avaliações",
    scoreAriaLabel: (score: number) => `Nota: ${score}`,
  };

  function createMockVMReturn(
    overrides?: Partial<ResultsViewModelReturn>
  ): ResultsViewModelReturn {
    return {
      metrics: {
        totalCompleted: 15,
        averageScore: 76,
      },
      isMetricsLoading: false,
      isMetricsError: false,

      results: [
        {
          id: "r1",
          title: "Fundamentos de LGPD",
          score: 78,
          completedAt: "2026-05-20",
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

      isLoading: false,
      error: null,
      serverMessage: null,
      onCloseMsg: vi.fn(),
      handleRetry: vi.fn(),
      labels: mockLabels,
      ...overrides,
    };
  }

  it("deve renderizar o painel de KPIs e os cards da lista de resultados", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn()
    );

    renderView();

    expect(screen.getByText("JORNADAS CONCLUÍDAS")).toBeDefined();
    expect(screen.getByText("15")).toBeDefined();
    expect(screen.getByText("MÉDIA DAS NOTAS")).toBeDefined();
    expect(screen.getByText("76")).toBeDefined();

    expect(screen.getByText("Jornadas concluídas")).toBeDefined();
    expect(screen.getByText("Fundamentos de LGPD")).toBeDefined();
  });

  it("deve exibir a cor/status condicional e aria-label da nota no ResultCard conforme limites (75, 74, 60, 59)", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        results: [
          { id: "r1", title: "Alta", score: 75, completedAt: "2026-05-20" },
          { id: "r2", title: "Media", score: 74, completedAt: "2026-05-20" },
          { id: "r3", title: "Baixa", score: 59, completedAt: "2026-05-20" },
        ],
      })
    );

    renderView();

    const scoreTags = screen.getAllByTestId("result-score-tag");
    expect(scoreTags).toHaveLength(3);

    // Score 75 (Alto -> emerald)
    expect(scoreTags[0].getAttribute("aria-label")).toBe("Nota: 75");
    expect(scoreTags[0].className).toContain("emerald");

    // Score 74 (Medio -> amber)
    expect(scoreTags[1].getAttribute("aria-label")).toBe("Nota: 74");
    expect(scoreTags[1].className).toContain("amber");

    // Score 59 (Baixo -> destructive)
    expect(scoreTags[2].getAttribute("aria-label")).toBe("Nota: 59");
    expect(scoreTags[2].className).toContain("destructive");

    // Garantir que não exibe descrição nem contagem de perguntas
    expect(screen.queryByText(/perguntas/i)).toBeNull();
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
    expect(screen.queryByText("JORNADAS CONCLUÍDAS")).toBeNull();

    fireEvent.click(screen.getAllByText("Tentar novamente")[0]);
    expect(handleRetryMock).toHaveBeenCalled();
  });

  it("deve exibir a mensagem de erro especifica da listagem (nao a de metricas) quando isResultsError for true", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        isResultsError: true,
        resultsErrorMessage: "Falha ao carregar a listagem de resultados.",
        results: [],
        serverMessage: {
          title: "Erro ao carregar resultados",
          description: "Falha ao carregar as estatisticas de resultados.",
          variant: "destructive",
        },
      })
    );

    renderView();

    expect(
      screen.getByText("Falha ao carregar a listagem de resultados.")
    ).toBeDefined();
    expect(
      screen.getByText("Falha ao carregar as estatisticas de resultados.")
    ).toBeDefined();
  });

  it("deve renderizar o ResultsEmptyState com o botao CTA levando a /jornadas quando emptyState = 'no-results'", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        results: [],
        emptyState: "no-results",
      })
    );

    renderView();

    expect(screen.getByText("Nenhuma jornada concluída")).toBeDefined();
    expect(
      screen.getByText(
        "Você ainda não concluiu nenhuma jornada. Seus resultados aparecerão aqui."
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
      "Buscar jornada pelo nome..."
    );
    fireEvent.change(searchInput, { target: { value: "LGPD" } });

    expect(handleSearchChangeMock).toHaveBeenCalledWith("LGPD");
  });
});
