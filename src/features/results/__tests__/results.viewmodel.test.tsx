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
    if (key === "questionsCount") return `${params?.count} perguntas`;
    if (key === "pagination.pageOf")
      return `Página ${params?.current} de ${params?.total}`;
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
  };

  const mockResultsList = {
    items: [
      {
        id: "r1",
        title: "Fundamentos de LGPD",
        score: 78,
        completedAt: "2026-05-20T00:00:00Z",
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

  it("deve carregar inicialmente as métricas e a listagem de resultados paginados", async () => {
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
    expect(result.current.metrics?.averageScore).toBe(76);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe("Fundamentos de LGPD");
    expect(result.current.emptyState).toBe("none");
    expect(result.current.error).toBeNull();
  });

  it("deve calcular emptyState = 'no-results' quando a lista for vazia e sem busca", async () => {
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

  it("deve sanitizar mensagem tecnica crua do backend", async () => {
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
