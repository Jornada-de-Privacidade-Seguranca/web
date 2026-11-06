// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import * as resultsService from "@services/resultsService";
import { useAuthStore } from "@features/auth/auth.store";
import { useResultsVM } from "../results.viewmodel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "completedAt") return `Concluída em ${params?.date}`;
    if (key === "completedScoreTag") return `Concluída · ${params?.score}/100`;
    if (key === "kpiDomainScore") return `${params?.score}/100`;
    if (key === "pagination.pageOf")
      return `Página ${params?.current} de ${params?.total}`;
    if (key === "filtersButtonWithCount")
      return `Filtros (${params?.count})`;
    return key;
  },
  useLocale: () => "pt",
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe("useResultsVM", () => {
  const mockMetrics = {
    totalCompleted: 15,
    averageScore: 76,
    domainMetrics: [
      { domain: "privacy", label: "Privacidade", averageScore: 84 },
      { domain: "security", label: "Segurança da Informação", averageScore: 60 },
      { domain: "joint", label: "Conjunta", averageScore: null },
    ],
  };

  const mockResultsList = {
    items: [
      {
        id: "r1",
        title: "Fundamentos de LGPD",
        score: 78,
        completedAt: "2026-05-20T00:00:00Z",
        domain: "privacy" as const,
        domainLabel: "Privacidade",
      },
    ],
    total: 1,
    page: 1,
    limit: 6,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: {
        id: 1,
        name: "Maria Oliveira",
        email: "maria@empresa.com",
        role: "common_user",
        profile: {
          role: "common_user",
          label: "Colaborador",
          user_type_id: 1,
          profile_type_id: 1,
          profile_type_name: "Colaborador",
        },
        active_status: 1,
      },
      isLoading: false,
    });
  });

  it("deve carregar inicialmente as métricas com domínios e a listagem de resultados paginados", async () => {
    vi.spyOn(resultsService, "getMetrics").mockResolvedValue(mockMetrics);
    vi.spyOn(resultsService, "getResultsList").mockResolvedValue(mockResultsList);

    const { result } = renderHook(() => useResultsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isMetricsLoading).toBe(false);
      expect(result.current.isResultsLoading).toBe(false);
    });

    expect(result.current.metrics?.totalCompleted).toBe(15);
    expect(result.current.metrics?.domainMetrics).toHaveLength(3);
    expect(result.current.metrics?.domainMetrics[0].label).toBe("Privacidade");
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe("Fundamentos de LGPD");
    expect(result.current.emptyState).toBe("none");
    expect(result.current.error).toBeNull();
  });

  it("deve alternar a seleção de filtro de domínio e resetar para a primeira página", async () => {
    vi.spyOn(resultsService, "getMetrics").mockResolvedValue(mockMetrics);
    vi.spyOn(resultsService, "getResultsList").mockResolvedValue(mockResultsList);

    const { result } = renderHook(() => useResultsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isResultsLoading).toBe(false);
    });

    act(() => {
      result.current.handlePageChange(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.handleToggleDomainFilter("privacy");
    });

    expect(result.current.filters.domains).toEqual(["privacy"]);
    expect(result.current.activeFiltersCount).toBe(1);
    expect(result.current.page).toBe(1);

    // Toggle off
    act(() => {
      result.current.handleToggleDomainFilter("privacy");
    });
    expect(result.current.filters.domains).toEqual([]);
    expect(result.current.activeFiltersCount).toBe(0);

    // Clear filters
    act(() => {
      result.current.handleToggleDomainFilter("security");
      result.current.handleClearFilters();
    });
    expect(result.current.filters.domains).toEqual([]);
  });

  it("deve alternar o painel de filtros (isFilterPanelOpen)", async () => {
    vi.spyOn(resultsService, "getMetrics").mockResolvedValue(mockMetrics);
    vi.spyOn(resultsService, "getResultsList").mockResolvedValue(mockResultsList);

    const { result } = renderHook(() => useResultsVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFilterPanelOpen).toBe(false);
    act(() => {
      result.current.handleToggleFilterPanel();
    });
    expect(result.current.isFilterPanelOpen).toBe(true);
  });

  it("deve calcular emptyState = 'no-results' quando a lista for vazia e sem filtros", async () => {
    vi.spyOn(resultsService, "getMetrics").mockResolvedValue(mockMetrics);
    vi.spyOn(resultsService, "getResultsList").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 1,
    });

    const { result } = renderHook(() => useResultsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isResultsLoading).toBe(false);
    });

    expect(result.current.emptyState).toBe("no-results");
  });

  it("deve atualizar o termo de busca e calcular emptyState = 'no-search-matches'", async () => {
    vi.spyOn(resultsService, "getMetrics").mockResolvedValue(mockMetrics);
    vi.spyOn(resultsService, "getResultsList").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 1,
    });

    const { result } = renderHook(() => useResultsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isResultsLoading).toBe(false);
    });

    act(() => {
      result.current.handleSearchChange("LGPDInexistente");
    });

    expect(result.current.searchTerm).toBe("LGPDInexistente");

    await waitFor(
      () => {
        expect(result.current.emptyState).toBe("no-search-matches");
      },
      { timeout: 1000 }
    );
  });

  it("deve sanitizar mensagem técnica crua do backend", async () => {
    vi.spyOn(resultsService, "getMetrics").mockRejectedValue(
      new Error("The route api/results could not be found.")
    );
    vi.spyOn(resultsService, "getResultsList").mockRejectedValue(
      new Error("The route api/results could not be found.")
    );

    const { result } = renderHook(() => useResultsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isMetricsLoading).toBe(false);
      expect(result.current.isResultsLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error).not.toContain("The route");
  });
});
