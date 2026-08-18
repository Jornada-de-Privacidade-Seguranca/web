// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as ResultsService from "@services/ResultsService";
import { useAuthStore } from "@features/auth/auth.store";
import { useResultsVM } from "../results.viewmodel";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "completedAt") return `Concluída em ${params?.date}`;
    if (key === "questionsCount") return `${params?.count} perguntas`;
    if (key === "pagination.pageOf")
      return `Página ${params?.current} de ${params?.total}`;
    return key;
  },
}));

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
        description: "Avalie seu domínio sobre princípios de proteção de dados",
        score: 78,
        completedAt: "2026-05-20T00:00:00Z",
        questionsCount: 5,
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
    vi.spyOn(ResultsService, "getMetrics").mockResolvedValue(mockMetrics);
    vi.spyOn(ResultsService, "getResultsList").mockResolvedValue(mockResultsList);

    const { result } = renderHook(() => useResultsVM());

    await waitFor(() => {
      expect(result.current.isMetricsLoading).toBe(false);
      expect(result.current.isResultsLoading).toBe(false);
    });

    expect(result.current.metrics?.totalCompleted).toBe(15);
    expect(result.current.metrics?.averageScore).toBe(76);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe("Fundamentos de LGPD");
    expect(result.current.error).toBeNull();
  });

  it("deve atualizar o termo de busca e disparar chamada filtrada ao serviço", async () => {
    vi.spyOn(ResultsService, "getMetrics").mockResolvedValue(mockMetrics);
    const listSpy = vi
      .spyOn(ResultsService, "getResultsList")
      .mockResolvedValue(mockResultsList);

    const { result } = renderHook(() => useResultsVM());

    await waitFor(() => {
      expect(result.current.isResultsLoading).toBe(false);
    });

    act(() => {
      result.current.handleSearchChange("LGPD");
    });

    expect(result.current.searchTerm).toBe("LGPD");

    await waitFor(
      () => {
        expect(listSpy).toHaveBeenCalledWith({ page: 1, limit: 6, search: "LGPD" });
      },
      { timeout: 1000 }
    );
  });

  it("deve atualizar a página e refazer a chamada ao serviço", async () => {
    vi.spyOn(ResultsService, "getMetrics").mockResolvedValue(mockMetrics);
    const listSpy = vi
      .spyOn(ResultsService, "getResultsList")
      .mockResolvedValue(mockResultsList);

    const { result } = renderHook(() => useResultsVM());

    await waitFor(() => {
      expect(result.current.isResultsLoading).toBe(false);
    });

    act(() => {
      result.current.handlePageChange(2);
    });

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith({ page: 2, limit: 6, search: "" });
    });
  });

  it("deve tratar erro 500 do backend populando o estado de erro e serverMessage", async () => {
    vi.spyOn(ResultsService, "getMetrics").mockRejectedValue(
      new Error("Erro 500 ao carregar métricas")
    );
    vi.spyOn(ResultsService, "getResultsList").mockRejectedValue(
      new Error("Erro 500 ao carregar listagem")
    );

    const { result } = renderHook(() => useResultsVM());

    await waitFor(() => {
      expect(result.current.isMetricsLoading).toBe(false);
      expect(result.current.isResultsLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.serverMessage?.variant).toBe("destructive");

    act(() => {
      result.current.onCloseMsg();
    });

    expect(result.current.serverMessage).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
