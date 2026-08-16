// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as AssessmentsService from "@services/AssessmentsService";
import { useAuthStore } from "@features/auth/auth.store";
import { useAssessmentsVM } from "../assessments.viewmodel";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "questionsCount") return `${params?.count} perguntas`;
    if (key === "estimatedMinutes") return `${params?.minutes} min`;
    if (key === "pagination.pageOf")
      return `Página ${params?.current} de ${params?.total}`;
    return key;
  },
}));

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
    useAuthStore.setState({
      user: { id: "usr_1", name: "Maria Oliveira", firstName: "Maria" },
      token: "valid-token",
      isAuthenticated: true,
    });
  });

  it("deve carregar inicialmente as listas de jornadas pendentes e catálogo paginados", async () => {
    vi.spyOn(AssessmentsService, "getPendingAssessments").mockResolvedValue(
      mockPendingJourneys
    );
    vi.spyOn(AssessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );

    const { result } = renderHook(() => useAssessmentsVM());

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
      expect(result.current.isCatalogLoading).toBe(false);
    });

    expect(result.current.pendingJourneys).toHaveLength(1);
    expect(result.current.pendingJourneys[0].title).toBe("Segurança na Nuvem");
    expect(result.current.catalogJourneys).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("deve atualizar o termo de busca no catálogo e chamar o serviço com o termo filtrado", async () => {
    vi.spyOn(AssessmentsService, "getPendingAssessments").mockResolvedValue(
      mockPendingJourneys
    );
    const catalogSpy = vi
      .spyOn(AssessmentsService, "getCatalogAssessments")
      .mockResolvedValue(mockCatalogJourneys);

    const { result } = renderHook(() => useAssessmentsVM());

    await waitFor(() => {
      expect(result.current.isCatalogLoading).toBe(false);
    });

    act(() => {
      result.current.handleSearchChange("LGPD");
    });

    expect(result.current.searchTerm).toBe("LGPD");

    await waitFor(
      () => {
        expect(catalogSpy).toHaveBeenCalledWith(
          { page: 1, limit: 6, search: "LGPD" },
          "valid-token"
        );
      },
      { timeout: 1000 }
    );
  });

  it("deve atualizar a página de pendentes e do catálogo chamando o serviço com a nova página", async () => {
    const pendingSpy = vi
      .spyOn(AssessmentsService, "getPendingAssessments")
      .mockResolvedValue(mockPendingJourneys);
    const catalogSpy = vi
      .spyOn(AssessmentsService, "getCatalogAssessments")
      .mockResolvedValue(mockCatalogJourneys);

    const { result } = renderHook(() => useAssessmentsVM());

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
    });

    act(() => {
      result.current.handlePendingPageChange(2);
    });

    await waitFor(() => {
      expect(pendingSpy).toHaveBeenCalledWith(
        { page: 2, limit: 6 },
        "valid-token"
      );
    });

    act(() => {
      result.current.handleCatalogPageChange(3);
    });

    await waitFor(() => {
      expect(catalogSpy).toHaveBeenCalledWith(
        { page: 3, limit: 6, search: "" },
        "valid-token"
      );
    });
  });

  it("deve tratar erro 500 do backend populando o estado de erro, variante destructive em serverMessage e fechamento via onCloseMsg", async () => {
    vi.spyOn(AssessmentsService, "getPendingAssessments").mockRejectedValue(
      new Error("Erro 500 do Servidor")
    );
    vi.spyOn(AssessmentsService, "getCatalogAssessments").mockRejectedValue(
      new Error("Erro 500 do Servidor")
    );

    const { result } = renderHook(() => useAssessmentsVM());

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
      expect(result.current.isCatalogLoading).toBe(false);
    });

    expect(result.current.error).toBe("Erro 500 do Servidor");
    expect(result.current.serverMessage?.variant).toBe("destructive");
    expect(result.current.serverMessage?.description).toBe("Erro 500 do Servidor");

    act(() => {
      result.current.onCloseMsg();
    });

    expect(result.current.serverMessage).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
