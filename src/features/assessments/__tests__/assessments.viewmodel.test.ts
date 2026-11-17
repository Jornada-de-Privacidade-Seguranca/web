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

const mockCurrentJourney = vi.hoisted(() => ({
  journeyId: null as string | null,
  profileId: null as string | null,
}));

vi.mock("@hooks/useJourneyContext", () => ({
  useJourneyContext: () => ({
    ...mockCurrentJourney,
    profileName: null,
    domain: null,
    isLoading: false,
    isError: false,
    isNotFound: !mockCurrentJourney.journeyId,
    refetch: () => {},
  }),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "pt",
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "questionsCount") return `${params?.count} perguntas`;
    if (key === "competenciesCount") return `${params?.count} competências`;
    if (key === "estimatedMinutes") return `${params?.minutes} min`;
    if (key === "completedScoreBadge") return `Concluída · ${params?.score}/100`;
    if (key === "filtersButtonWithCount") return `Filtros (${params?.count})`;
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
        domain: "security" as const,
        competenciesCount: 10,
        estimatedMinutes: 15,
        status: "in_progress" as const,
        isSelfStarted: true,
      },
    ],
    total: 1,
    page: 1,
    limit: 1,
    totalPages: 1,
  };

  const mockCatalogJourneys = {
    items: [
      {
        id: "1",
        title: "LGPD para Desenvolvedores",
        description: "Práticas de desenvolvimento seguro",
        domain: "privacy" as const,
        competenciesCount: 12,
        estimatedMinutes: 18,
        status: "not_started" as const,
        href: "/jornada/perfil/1",
      },
      {
        id: "2",
        title: "Gestão de Incidentes de Segurança",
        description: "Como responder a vazamentos de dados",
        domain: "security" as const,
        competenciesCount: 8,
        estimatedMinutes: 12,
        status: "completed" as const,
        score: 90,
        href: "/jornada/2",
      },
      {
        id: "3",
        title: "Governança e Privacidade",
        description: "Conformidade integrada",
        domain: "joint" as const,
        competenciesCount: 15,
        estimatedMinutes: 22,
        status: "not_started" as const,
        href: "/jornada/perfil/3",
      },
    ],
    total: 3,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockAuth.user = { id: 1 };
    mockAuth.isLoading = false;
    mockCurrentJourney.journeyId = null;
    mockCurrentJourney.profileId = null;

    vi.spyOn(assessmentsService, "getPendingAssessments").mockResolvedValue(
      mockPendingJourneys
    );
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue(
      mockCatalogJourneys
    );
  });

  it("deve carregar jornada pendente (no singular) e catálogo com sucesso", async () => {
    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasPendingJourney).toBe(true);
    });

    expect(result.current.pendingJourney?.title).toBe("Segurança na Nuvem");
    expect(result.current.catalogJourneys).toHaveLength(3);
    expect(result.current.catalogTotalPages).toBe(1);
    // O idioma da tela vai para o service, que escolhe o nome da jornada pendente
    expect(assessmentsService.getPendingAssessments).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 1, page: 1, perPage: 1, locale: "pt" })
    );
  });

  it("deve ocultar a seção de jornada pendente quando não houver nenhuma", async () => {
    vi.spyOn(assessmentsService, "getPendingAssessments").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
    });

    expect(result.current.hasPendingJourney).toBe(false);
    expect(result.current.pendingJourney).toBeNull();
  });

  it("deve gerenciar modal de cancelamento para jornada iniciada pelo usuário", async () => {
    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasPendingJourney).toBe(true);
    });

    expect(result.current.isCancelModalOpen).toBe(false);

    act(() => {
      result.current.handleOpenCancelModal();
    });
    expect(result.current.isCancelModalOpen).toBe(true);

    act(() => {
      result.current.handleCloseCancelModal();
    });
    expect(result.current.isCancelModalOpen).toBe(false);

    act(() => {
      result.current.handleConfirmCancelJourney();
    });
    expect(result.current.isCancelModalOpen).toBe(false);
    expect(result.current.hasPendingJourney).toBe(false);
  });

  it("deve filtrar o catálogo por busca textual", async () => {
    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.catalogJourneys).toHaveLength(3);
    });

    act(() => {
      result.current.handleSearchChange("Incidentes");
    });

    await waitFor(() => {
      expect(result.current.catalogJourneys).toHaveLength(1);
      expect(result.current.catalogJourneys[0].title).toContain(
        "Gestão de Incidentes"
      );
    });
  });

  it("deve filtrar o catálogo por domínio (múltipla seleção)", async () => {
    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.catalogJourneys).toHaveLength(3);
    });

    act(() => {
      result.current.handleToggleDomainFilter("privacy");
    });

    expect(result.current.activeFiltersCount).toBe(1);
    expect(result.current.catalogJourneys).toHaveLength(1);
    expect(result.current.catalogJourneys[0].domain).toBe("privacy");

    // Limpar filtros
    act(() => {
      result.current.handleClearFilters();
    });

    expect(result.current.activeFiltersCount).toBe(0);
    expect(result.current.catalogJourneys).toHaveLength(3);
  });

  it("deve filtrar o catálogo por situação (múltipla seleção)", async () => {
    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.catalogJourneys).toHaveLength(3);
    });

    act(() => {
      result.current.handleToggleStatusFilter("completed");
    });

    expect(result.current.activeFiltersCount).toBe(1);
    expect(result.current.catalogJourneys).toHaveLength(1);
    expect(result.current.catalogJourneys[0].status).toBe("completed");
    expect(result.current.catalogJourneys[0].score).toBe(90);
    expect(
      result.current.labels.completedScoreBadge(result.current.catalogJourneys[0].score!)
    ).toBe("Concluída · 90/100");

    // Filtra por não iniciadas
    act(() => {
      result.current.handleToggleStatusFilter("completed");
      result.current.handleToggleStatusFilter("not_started");
    });
    expect(result.current.catalogJourneys).toHaveLength(2);
    expect(result.current.catalogJourneys.every((j) => j.status === "not_started")).toBe(true);
  });

  it("deve retornar mensagem amigável de t(errorMessage) quando as queries falharem", async () => {
    vi.spyOn(assessmentsService, "getPendingAssessments").mockRejectedValue(
      new Error("Database connection refused")
    );
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockRejectedValue(
      new Error("500 Internal Server Error")
    );

    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPendingLoading).toBe(false);
      expect(result.current.isCatalogLoading).toBe(false);
    });

    expect(result.current.pendingError).toBe("Erro ao carregar dados do servidor.");
    expect(result.current.catalogError).toBe("Erro ao carregar dados do servidor.");
  });
});
