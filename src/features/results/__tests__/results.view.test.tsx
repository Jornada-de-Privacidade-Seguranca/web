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
    searchEmpty: "Nenhum resultado encontrado para o termo buscado.",
    userEmpty: "Você ainda não concluiu nenhuma jornada. Seus resultados aparecerão aqui.",
    completedAt: (dateStr: string) => `Concluída em ${dateStr}`,
    questionsCount: (count: number) => `${count} perguntas`,
    viewResult: "Ver resultado",
    paginationPrevious: "Anterior",
    paginationNext: "Próximo",
    paginationPageOf: (current: number, total: number) =>
      `Página ${current} de ${total}`,
    errorTitle: "Erro ao carregar resultados",
    errorMessage: "Não foi possível carregar os resultados das avaliações.",
    retryButton: "Tentar novamente",
    loadingAriaLabel: "Carregando resultados de avaliações",
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

      results: [
        {
          id: "r1",
          title: "Fundamentos de LGPD",
          description: "Avalie seu domínio sobre princípios de proteção de dados",
          score: 78,
          completedAt: "2026-05-20",
          questionsCount: 5,
        },
      ],
      page: 1,
      totalPages: 1,
      isResultsLoading: false,
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

  it("deve exibir a cor/status condicional da nota no ResultCard", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        results: [
          {
            id: "r1",
            title: "Fundamentos de LGPD",
            description: "Descrição",
            score: 78,
            completedAt: "2026-05-20",
            questionsCount: 5,
          },
        ],
      })
    );

    renderView();

    const scoreTag = screen.getByTestId("result-score-tag");
    expect(scoreTag).toBeDefined();
    expect(scoreTag.textContent).toContain("78");
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

  it("deve renderizar o EmptyState quando a lista de resultados estiver vazia", () => {
    vi.spyOn(viewModelModule, "useResultsVM").mockReturnValue(
      createMockVMReturn({
        results: [],
      })
    );

    renderView();

    expect(
      screen.getByText(
        "Você ainda não concluiu nenhuma jornada. Seus resultados aparecerão aqui."
      )
    ).toBeDefined();
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
