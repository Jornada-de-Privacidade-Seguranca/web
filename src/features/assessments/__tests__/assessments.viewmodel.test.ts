// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as assessmentsService from "@services/assessmentsService";
import { useAssessmentsVM } from "../assessments.viewmodel";

const mockAuth = vi.hoisted(() => ({
  user: { id: 1 } as { id: number } | null,
  isLoading: false,
}));

vi.mock("@hooks/useAuth", () => ({
  useAuth: () => mockAuth,
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "questionsCount") return `${params?.count} perguntas`;
    if (key === "estimatedMinutes") return `${params?.minutes} min`;
    if (key === "pagination.pageOf")
      return `Página ${params?.current} de ${params?.total}`;
    if (key === "errorMessage") return "Erro ao carregar dados do servidor.";
    return key;
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  function TestQueryProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return TestQueryProvider;
}

describe("useAssessmentsVM", () => {
  const mockPendingJourneys = {
    items: [
      {
        id: "p1",
        title: "Segurança na Nuvem",
        description: "Fundamentos de segurança em nuvem",
        totalQuestions: 10,
        estimatedMinutes: 15,
        status: "in_progress" as const,
      },
    ],
    total: 1,
    page: 1,
    limit: 6,
    totalPages: 1,
  };

  const mockCatalogJourneys = {
    items: [
      {
        id: "c1",
        title: "LGPD para Desenvolvedores",
        description: "Como aplicar privacidade no código",
        totalQuestions: 12,
        estimatedMinutes: 20,
        status: "completed" as const,
      },
      {
        id: "c2",
        title: "Segurança na Nuvem",
        description: "Fundamentos de segurança em nuvem",
        totalQuestions: 10,
        estimatedMinutes: 15,
        status: "in_progress" as const,
      },
    ],
    total: 2,
    page: 1,
    limit: 6,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockAuth.user = { id: 1 };
    mockAuth.isLoading = false;
  });

  it("deve carregar inicialmente as listas de jornadas pendentes e catálogo paginados", async () => {
    vi.spyOn(assessmentsService, "getPendingAssessments").mockResolvedValue(
      mockPendingJourneys
    );
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );

    const { result } = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
      expect(result.current.isCatalogLoading).toBe(false);
    });

    expect(result.current.pendingJourneys).toHaveLength(1);
    expect(result.current.pendingTotal).toBe(1);
    expect(result.current.pendingJourneys[0].title).toBe("Segurança na Nuvem");
    expect(result.current.catalogJourneys).toHaveLength(2);
    expect(result.current.isPendingSectionVisible).toBe(true);
    expect(result.current.pendingError).toBeNull();
    expect(result.current.catalogPageError).toBeNull();
  });

  it("deve definir isPendingSectionVisible como false apenas quando não houver jornadas pendentes e sem erro", async () => {
    vi.spyOn(assessmentsService, "getPendingAssessments").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 0,
    });
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );

    const { result } = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
    });

    expect(result.current.pendingJourneys).toHaveLength(0);
    expect(result.current.isPendingSectionVisible).toBe(false);
  });

  it("deve manter a seção de pendentes visível e exibir pendingError quando o fetch de pendentes falhar", async () => {
    vi.spyOn(assessmentsService, "getPendingAssessments").mockRejectedValue(
      new Error("Falha ao carregar pendentes")
    );
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );

    const { result } = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
    });

    expect(result.current.isPendingSectionVisible).toBe(true);
    expect(result.current.pendingError).toBe("Falha ao carregar pendentes");
  });

  it("deve converter mensagens genéricas de Failed to fetch para a string de erro traduzida", async () => {
    vi.spyOn(assessmentsService, "getPendingAssessments").mockRejectedValue(
      new TypeError("Failed to fetch")
    );
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );

    const { result } = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
    });

    expect(result.current.pendingError).toBe("Erro ao carregar dados do servidor.");
  });

  it("deve atualizar o termo de busca no catálogo e chamar o serviço com o termo filtrado", async () => {
    vi.spyOn(assessmentsService, "getPendingAssessments").mockResolvedValue(
      mockPendingJourneys
    );
    const catalogSpy = vi
      .spyOn(assessmentsService, "getCatalogAssessments")
      .mockResolvedValue(mockCatalogJourneys);

    const { result } = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isCatalogLoading).toBe(false);
    });

    act(() => {
      result.current.handleSearchChange("LGPD");
    });

    expect(result.current.searchTerm).toBe("LGPD");

    await waitFor(
      () => {
        expect(catalogSpy).toHaveBeenCalledWith({ page: 1, limit: 6, search: "LGPD" });
      },
      { timeout: 1000 }
    );
  });

  it("deve atualizar a página de pendentes e do catálogo chamando o serviço com a nova página", async () => {
    const pendingSpy = vi
      .spyOn(assessmentsService, "getPendingAssessments")
      .mockResolvedValue(mockPendingJourneys);
    const catalogSpy = vi
      .spyOn(assessmentsService, "getCatalogAssessments")
      .mockResolvedValue(mockCatalogJourneys);

    const { result } = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
    });

    act(() => {
      result.current.handlePendingPageChange(2);
    });

    await waitFor(() => {
      expect(pendingSpy).toHaveBeenCalledWith({ userId: 1, page: 2, perPage: 6 });
    });

    act(() => {
      result.current.handleCatalogPageChange(3);
    });

    await waitFor(() => {
      expect(catalogSpy).toHaveBeenCalledWith({ page: 3, limit: 6, search: "" });
    });
  });

  it("deve manter os dados da página anterior e expor pendingPageError pontual quando a troca de página falhar", async () => {
    const pendingSpy = vi.spyOn(assessmentsService, "getPendingAssessments");
    pendingSpy.mockResolvedValueOnce(mockPendingJourneys);
    pendingSpy.mockRejectedValueOnce(new Error("Falha ao trocar de página"));
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );

    const { result } = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.pendingJourneys).toHaveLength(1);
    });

    act(() => {
      result.current.handlePendingPageChange(2);
    });

    await waitFor(() => {
      expect(result.current.pendingPageError).toBe("Falha ao trocar de página");
    });

    // Os cards da página anterior continuam disponíveis; não vira erro de seção.
    expect(result.current.pendingJourneys).toHaveLength(1);
    expect(result.current.pendingError).toBeNull();

    act(() => {
      result.current.dismissPendingPageError();
    });

    expect(result.current.pendingPageError).toBeNull();
  });

  it("deve buscar as jornadas pendentes do usuário autenticado", async () => {
    const pendingSpy = vi
      .spyOn(assessmentsService, "getPendingAssessments")
      .mockResolvedValue(mockPendingJourneys);
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );

    renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(pendingSpy).toHaveBeenCalledWith({ userId: 1, page: 1, perPage: 6 });
    });
  });

  it("não deve buscar jornadas pendentes enquanto não houver usuário na sessão", async () => {
    mockAuth.user = null;
    mockAuth.isLoading = true;
    const pendingSpy = vi
      .spyOn(assessmentsService, "getPendingAssessments")
      .mockResolvedValue(mockPendingJourneys);
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );

    const { result } = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isCatalogLoading).toBe(false);
    });

    expect(pendingSpy).not.toHaveBeenCalled();
    // Mantém o skeleton enquanto a sessão carrega, em vez de ocultar a seção.
    expect(result.current.isPendingLoading).toBe(true);
    expect(result.current.isPendingSectionVisible).toBe(true);
  });
});
