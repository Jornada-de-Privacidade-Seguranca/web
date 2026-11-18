// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as assessmentsService from "@services/assessmentsService";
import { ApiRequestError } from "@services/httpClient";
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
  resumeAreaIndex: 0,
}));

vi.mock("@hooks/useJourneyContext", () => ({
  CURRENT_JOURNEY_QUERY_KEY: ["journey", "current"],
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

let lastQueryClient: QueryClient;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  lastQueryClient = queryClient;
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
        origin: "self_started" as const,
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
    mockCurrentJourney.resumeAreaIndex = 0;

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

  async function renderWithOpenCancelModal() {
    const hook = renderHook(() => useAssessmentsVM(), { wrapper: createWrapper() });
    await waitFor(() => expect(hook.result.current.hasPendingJourney).toBe(true));
    act(() => hook.result.current.handleOpenCancelModal());
    expect(hook.result.current.isCancelModalOpen).toBe(true);
    return hook;
  }

  it("abre e fecha a confirmação sem cancelar", async () => {
    const cancelSpy = vi.spyOn(assessmentsService, "cancelPendingJourney").mockResolvedValue();
    const { result } = await renderWithOpenCancelModal();

    act(() => result.current.handleCloseCancelModal());

    expect(result.current.isCancelModalOpen).toBe(false);
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it("cancela a jornada pendente pela API e recarrega a listagem, o Painel e a jornada atual", async () => {
    const cancelSpy = vi.spyOn(assessmentsService, "cancelPendingJourney").mockResolvedValue();
    const { result } = await renderWithOpenCancelModal();
    const invalidateSpy = vi.spyOn(lastQueryClient, "invalidateQueries");
    vi.mocked(assessmentsService.getPendingAssessments).mockResolvedValue({
      ...mockPendingJourneys,
      items: [],
      total: 0,
    });

    await act(async () => {
      await result.current.handleConfirmCancelJourney();
    });

    expect(cancelSpy).toHaveBeenCalledWith("p1");
    expect(result.current.isCancelModalOpen).toBe(false);
    expect(result.current.cancelSuccessMessage).toBe("cancelSuccess");
    expect(invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      ["assessments"],
      ["dashboard"],
      ["journey", "current"],
    ]);
    await waitFor(() => expect(result.current.hasPendingJourney).toBe(false));

    act(() => result.current.handleDismissCancelSuccess());
    expect(result.current.cancelSuccessMessage).toBeNull();
  });

  it("ignora o segundo clique e não fecha a confirmação durante a chamada", async () => {
    let resolveCancel: () => void = () => {};
    const cancelSpy = vi.spyOn(assessmentsService, "cancelPendingJourney").mockImplementation(
      () => new Promise<void>((resolve) => {
        resolveCancel = resolve;
      })
    );
    const { result } = await renderWithOpenCancelModal();

    let firstCall: Promise<void> = Promise.resolve();
    act(() => {
      firstCall = result.current.handleConfirmCancelJourney();
    });
    await waitFor(() => expect(result.current.isCancellingJourney).toBe(true));

    await act(async () => {
      await result.current.handleConfirmCancelJourney();
    });
    act(() => result.current.handleCloseCancelModal());

    expect(cancelSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isCancelModalOpen).toBe(true);

    await act(async () => {
      resolveCancel();
      await firstCall;
    });
    expect(result.current.isCancellingJourney).toBe(false);
  });

  it.each([
    [new ApiRequestError("Nao permitido", 409, "JOURNEY_CANCELLATION_NOT_ALLOWED"), "cancelNotAllowed"],
    [new ApiRequestError("Sem permissao", 403, "PERMISSION_DENIED"), "cancelUnavailable"],
    [new ApiRequestError("Nao encontrada", 404, "JOURNEY_NOT_FOUND"), "cancelUnavailable"],
  ])("no erro %#, mostra a mensagem e recarrega a jornada pendente", async (error, message) => {
    vi.spyOn(assessmentsService, "cancelPendingJourney").mockRejectedValue(error);
    const { result } = await renderWithOpenCancelModal();
    const pendingCalls = vi.mocked(assessmentsService.getPendingAssessments).mock.calls.length;

    await act(async () => {
      await result.current.handleConfirmCancelJourney();
    });

    expect(result.current.cancelErrorMessage).toBe(message);
    expect(result.current.cancelSuccessMessage).toBeNull();
    await waitFor(() =>
      expect(vi.mocked(assessmentsService.getPendingAssessments).mock.calls.length).toBeGreaterThan(
        pendingCalls
      )
    );
  });

  it("em erro de rede ou 5xx, mantém a confirmação aberta para tentar de novo", async () => {
    const cancelSpy = vi
      .spyOn(assessmentsService, "cancelPendingJourney")
      .mockRejectedValueOnce(new ApiRequestError("Erro", 500))
      .mockResolvedValueOnce();
    const { result } = await renderWithOpenCancelModal();
    const pendingCalls = vi.mocked(assessmentsService.getPendingAssessments).mock.calls.length;

    await act(async () => {
      await result.current.handleConfirmCancelJourney();
    });

    expect(result.current.isCancelModalOpen).toBe(true);
    expect(result.current.cancelErrorMessage).toBe("cancelError");
    expect(vi.mocked(assessmentsService.getPendingAssessments).mock.calls.length).toBe(pendingCalls);

    await act(async () => {
      await result.current.handleConfirmCancelJourney();
    });

    expect(cancelSpy).toHaveBeenCalledTimes(2);
    expect(result.current.isCancelModalOpen).toBe(false);
  });

  it("deve buscar o catálogo na API com 9 por página, sem busca nem filtros", async () => {
    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.catalogJourneys).toHaveLength(3);
    });
    expect(assessmentsService.getCatalogAssessments).toHaveBeenCalledWith({
      page: 1,
      limit: 9,
      locale: "pt",
      search: "",
      domains: [],
      statuses: [],
    });
    expect(result.current.catalogTotalItems).toBe(3);
    expect(result.current.catalogTotalPages).toBe(1);
  });

  it("deve enviar a busca só depois da pausa na digitação, sem espaços nas pontas, e voltar à página 1", async () => {
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockResolvedValue({
      ...mockCatalogJourneys,
      totalPages: 3,
    });
    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.catalogTotalPages).toBe(3));

    act(() => result.current.handleCatalogPageChange(2));
    await waitFor(() =>
      expect(assessmentsService.getCatalogAssessments).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 })
      )
    );

    act(() => {
      result.current.handleSearchChange("Inc");
      result.current.handleSearchChange("  Incidentes ");
    });
    // O campo acompanha a digitação na hora, e a busca ainda não saiu
    expect(result.current.searchTerm).toBe("  Incidentes ");
    expect(assessmentsService.getCatalogAssessments).not.toHaveBeenCalledWith(
      expect.objectContaining({ search: "Inc" })
    );

    await waitFor(() =>
      expect(assessmentsService.getCatalogAssessments).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, search: "Incidentes" })
      )
    );
    expect(result.current.catalogPage).toBe(1);
  });

  it("deve enviar os filtros de domínio e situação e voltar à página 1", async () => {
    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.catalogJourneys).toHaveLength(3));

    act(() => result.current.handleCatalogPageChange(2));
    act(() => {
      result.current.handleToggleDomainFilter("privacy");
      result.current.handleToggleDomainFilter("joint");
      result.current.handleToggleStatusFilter("completed");
    });

    expect(result.current.activeFiltersCount).toBe(3);
    expect(result.current.catalogPage).toBe(1);
    await waitFor(() =>
      expect(assessmentsService.getCatalogAssessments).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          domains: ["privacy", "joint"],
          statuses: ["completed"],
        })
      )
    );

    act(() => result.current.handleClearFilters());

    expect(result.current.activeFiltersCount).toBe(0);
    await waitFor(() =>
      expect(assessmentsService.getCatalogAssessments).toHaveBeenLastCalledWith(
        expect.objectContaining({ domains: [], statuses: [] })
      )
    );
  });

  it("não deve deixar uma resposta antiga substituir a mais recente", async () => {
    let resolveSlow: (value: typeof mockCatalogJourneys) => void = () => {};
    const slowResponse = new Promise<typeof mockCatalogJourneys>((resolve) => {
      resolveSlow = resolve;
    });
    const latest = { ...mockCatalogJourneys, items: [mockCatalogJourneys.items[2]], total: 1 };
    vi.spyOn(assessmentsService, "getCatalogAssessments").mockImplementation(
      async ({ statuses = [] } = {}) =>
        statuses.includes("completed") ? latest : slowResponse
    );

    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    act(() => result.current.handleToggleStatusFilter("completed"));
    await waitFor(() => expect(result.current.catalogJourneys).toEqual(latest.items));

    // A primeira consulta, sem filtro, só termina agora
    await act(async () => {
      resolveSlow(mockCatalogJourneys);
    });

    expect(result.current.catalogJourneys).toEqual(latest.items);
  });

  it("deve levar o \"Continuar jornada\" à primeira área com competências sem resposta", async () => {
    mockCurrentJourney.journeyId = "p1";
    mockCurrentJourney.profileId = "7";
    mockCurrentJourney.resumeAreaIndex = 2;

    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.hasPendingJourney).toBe(true));
    expect(result.current.pendingJourney?.href).toBe("/jornada/atual/competencias/2");
  });

  it("deve tentar de novo a jornada pendente e o catálogo separadamente", async () => {
    const pendingSpy = vi
      .spyOn(assessmentsService, "getPendingAssessments")
      .mockRejectedValueOnce(new Error("falha"))
      .mockResolvedValue(mockPendingJourneys);
    const catalogSpy = vi
      .spyOn(assessmentsService, "getCatalogAssessments")
      .mockRejectedValueOnce(new Error("falha"))
      .mockResolvedValue(mockCatalogJourneys);

    const { result } = renderHook(() => useAssessmentsVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.pendingError).toBe("Erro ao carregar dados do servidor.");
      expect(result.current.catalogError).toBe("Erro ao carregar dados do servidor.");
    });

    act(() => result.current.handleRetryPending());
    await waitFor(() => expect(result.current.hasPendingJourney).toBe(true));
    expect(result.current.catalogError).not.toBeNull();
    expect(catalogSpy).toHaveBeenCalledTimes(1);

    act(() => result.current.handleRetryCatalog());
    await waitFor(() => expect(result.current.catalogJourneys).toHaveLength(3));
    expect(pendingSpy).toHaveBeenCalledTimes(2);
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
