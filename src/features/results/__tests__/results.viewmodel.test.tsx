// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import * as resultsService from "@services/resultsService";
import { useAuthStore } from "@features/auth/auth.store";
import { useResultsVM } from "../results.viewmodel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Usa o usuário do store sem conferir a sessão em /me, que falharia nos testes
// e limparia o usuário no meio do caso
vi.mock("@hooks/useAuth", () => ({
  useAuth: () => ({ user: useAuthStore.getState().user }),
}));

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
    if (key === "filterDomainPrivacy") return "Privacidade";
    if (key === "filterDomainSecurity") return "Segurança da Informação";
    if (key === "filterDomainJoint") return "Conjunta";
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
      { domain: "privacy", label: "Privacidade", namePt: "Privacidade", nameEn: "Privacy", averageScore: 84 },
      { domain: "security", label: "Segurança da Informação", namePt: "Segurança da Informação", nameEn: "Information Security", averageScore: 60 },
      { domain: "joint", label: "Conjunta", namePt: "Conjunta", nameEn: "Joint", averageScore: null },
    ],
  };

  const mockResultsList = {
    items: [
      {
        id: "r1",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        namePt: "Encarregado pelo Tratamento de Dados Pessoais",
        nameEn: "Data Protection Officer (DPO)",
        score: 88,
        completedAt: "2026-05-15T10:00:00Z",
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
    expect(result.current.results[0].title).toBe("Encarregado pelo Tratamento de Dados Pessoais");
    expect(result.current.emptyState).toBe("none");
    expect(result.current.error).toBeNull();
  });

  it("deve buscar os dados com o id do usuário autenticado", async () => {
    useAuthStore.setState({ user: { ...useAuthStore.getState().user!, id: 42 } });
    const metricsSpy = vi.spyOn(resultsService, "getMetrics").mockResolvedValue(mockMetrics);
    const listSpy = vi.spyOn(resultsService, "getResultsList").mockResolvedValue(mockResultsList);

    renderHook(() => useResultsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(metricsSpy).toHaveBeenCalledWith(42);
      expect(listSpy).toHaveBeenCalledWith(expect.objectContaining({ userId: 42 }));
    });
  });

  it("não deve buscar dados enquanto não houver usuário autenticado", async () => {
    useAuthStore.setState({ user: null });
    const metricsSpy = vi.spyOn(resultsService, "getMetrics").mockResolvedValue(mockMetrics);
    const listSpy = vi.spyOn(resultsService, "getResultsList").mockResolvedValue(mockResultsList);

    renderHook(() => useResultsVM(), { wrapper: createWrapper() });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(metricsSpy).not.toHaveBeenCalled();
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("deve montar dinamicamente os blocos de média a partir dos domínios dos dados, inclusive um domínio novo", async () => {
    const customMetrics = {
      totalCompleted: 8,
      domainMetrics: [
        { domain: "privacy", label: "Privacidade", namePt: "Privacidade", nameEn: "Privacy", averageScore: 84 },
        { domain: "ai_governance", label: "Governança de IA", namePt: "Governança de IA", nameEn: "AI Governance", averageScore: 92 },
      ],
    };

    vi.spyOn(resultsService, "getMetrics").mockResolvedValue(customMetrics);
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
      expect(result.current.isMetricsLoading).toBe(false);
    });

    expect(result.current.metrics?.domainMetrics).toHaveLength(2);
    expect(result.current.metrics?.domainMetrics[1]).toEqual(
      expect.objectContaining({
        domain: "ai_governance",
        label: "Governança de IA",
        averageScore: 92,
      })
    );
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
      result.current.handleSearchChange("PerfilInexistente");
    });

    expect(result.current.searchTerm).toBe("PerfilInexistente");

    await waitFor(
      () => {
        expect(result.current.emptyState).toBe("no-search-matches");
      },
      { timeout: 1000 }
    );
  });

  it("deve enviar à API a busca, depois da pausa na digitação, e os domínios escolhidos", async () => {
    vi.spyOn(resultsService, "getMetrics").mockResolvedValue(mockMetrics);
    const listSpy = vi
      .spyOn(resultsService, "getResultsList")
      .mockResolvedValue(mockResultsList);

    const { result } = renderHook(() => useResultsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, per_page: 6, search: "", domains: [] })
      );
    });

    act(() => {
      result.current.handleSearchChange("Enc");
      result.current.handleSearchChange("Encarregado");
    });

    // A busca só sai depois que a pessoa para de digitar, e só com o termo final
    expect(listSpy).not.toHaveBeenCalledWith(expect.objectContaining({ search: "Enc" }));
    await waitFor(
      () => {
        expect(listSpy).toHaveBeenCalledWith(
          expect.objectContaining({ search: "Encarregado", domains: [] })
        );
      },
      { timeout: 1000 }
    );

    act(() => {
      result.current.handleToggleDomainFilter("security");
    });

    await waitFor(() => {
      expect(listSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, search: "Encarregado", domains: ["security"] })
      );
    });
  });

  it("deve mostrar o erro e buscar de novo a lista e o resumo ao tentar novamente", async () => {
    const metricsSpy = vi
      .spyOn(resultsService, "getMetrics")
      .mockRejectedValueOnce(new Error("Não foi possível carregar o resumo dos resultados."))
      .mockResolvedValue(mockMetrics);
    const listSpy = vi
      .spyOn(resultsService, "getResultsList")
      .mockRejectedValueOnce(new Error("Não foi possível carregar os resultados das jornadas."))
      .mockResolvedValue(mockResultsList);

    const { result } = renderHook(() => useResultsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isMetricsError).toBe(true);
      expect(result.current.isResultsError).toBe(true);
    });
    expect(result.current.resultsErrorMessage).toBe(
      "Não foi possível carregar os resultados das jornadas."
    );

    act(() => {
      result.current.handleRetry();
    });

    await waitFor(() => {
      expect(result.current.isMetricsError).toBe(false);
      expect(result.current.isResultsError).toBe(false);
      expect(result.current.results).toHaveLength(1);
    });
    expect(metricsSpy).toHaveBeenCalledTimes(2);
    expect(listSpy).toHaveBeenCalledTimes(2);
  });

  it("deve sanitizar mensagem técnica crua do backend", async () => {
    vi.spyOn(resultsService, "getMetrics").mockRejectedValue(
      new Error("The route api/users/me/journeys could not be found.")
    );
    vi.spyOn(resultsService, "getResultsList").mockRejectedValue(
      new Error("The route api/users/me/journeys could not be found.")
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
