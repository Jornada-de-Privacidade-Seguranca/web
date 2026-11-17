// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as adminResultsService from "@services/adminResultsService";
import { ApiRequestError } from "@services/httpClient";
import { useAdminResultsVM } from "../adminResults.viewmodel";
import type {
  AdminResultsFilterOptions,
  AdminResultsPage,
  AdminResultsSummary,
} from "../adminResults.types";

const mockReplace = vi.fn();
let mockSearch = "";
let mockLocale = "pt";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  usePathname: () => "/admin/resultados",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "filters.counter") return `${params?.filtered} de ${params?.total} resultados`;
    if (key === "pagination.pageOf") return `Página ${params?.current} de ${params?.total}`;
    if (key === "summary.domainScore") return `${params?.score}/100`;
    if (key === "summary.emptyScore") return "—";
    if (key === "table.scoreValue") return `${params?.score}/100`;
    if (key === "table.scoreAriaLabel") return `Nota ${params?.score} de 100, nível ${params?.band}`;
    return key;
  },
  useLocale: () => mockLocale,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const resultsPage: AdminResultsPage = {
  items: [
    {
      id: "101",
      journeyId: "101",
      user: {
        id: "1",
        name: "Ana Beatriz Silva",
        email: "ana.silva@empresa.com",
        initials: "AS",
        department: "Tecnologia da Informação",
      },
      profileId: "6",
      profileTitle: "Auditor de Conformidade e Segurança",
      profileNamePt: "Auditor de Conformidade e Segurança",
      profileNameEn: "Compliance and Security Auditor",
      domain: "joint",
      domainNamePt: "Conjunta",
      domainNameEn: "Joint",
      domainLabel: "Conjunta",
      completedAt: "2026-06-08 14:20:00",
      score: 92,
      scoreBand: "strong",
    },
  ],
  total: 4,
  page: 1,
  limit: 6,
  totalPages: 1,
};

const filteredSummary: AdminResultsSummary = {
  totalCompletedJourneys: 4,
  totalEvaluatedUsers: 1,
  domainAverages: [
    {
      domain: "privacy",
      namePt: "Privacidade",
      nameEn: "Privacy",
      label: "Privacidade",
      averageScore: 90,
      completedCount: 1,
    },
    {
      domain: "security",
      namePt: "Segurança da Informação",
      nameEn: "Information Security",
      label: "Segurança da Informação",
      averageScore: null,
      completedCount: 0,
    },
  ],
};

const unfilteredSummary: AdminResultsSummary = {
  ...filteredSummary,
  totalCompletedJourneys: 14,
  totalEvaluatedUsers: 6,
};

const filterOptions: AdminResultsFilterOptions = {
  users: [{ id: "1", name: "Ana Beatriz Silva", email: "ana.silva@empresa.com" }],
  departments: ["Tecnologia da Informação"],
  domains: [
    { id: "privacy", namePt: "Privacidade", nameEn: "Privacy", label: "Privacidade" },
    {
      id: "security",
      namePt: "Segurança da Informação",
      nameEn: "Information Security",
      label: "Segurança da Informação",
    },
  ],
  journeyProfiles: [
    {
      id: "6",
      namePt: "Auditor de Conformidade e Segurança",
      nameEn: "Compliance and Security Auditor",
      label: "Auditor de Conformidade e Segurança",
    },
  ],
};

function mockServices() {
  const results = vi.spyOn(adminResultsService, "getAdminResults").mockResolvedValue(resultsPage);
  const metrics = vi
    .spyOn(adminResultsService, "getAdminResultsMetrics")
    .mockImplementation(async (filters = {}) =>
      Object.values(filters).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)))
        ? filteredSummary
        : unfilteredSummary
    );
  const options = vi
    .spyOn(adminResultsService, "getAdminResultsFilterOptions")
    .mockResolvedValue(filterOptions);
  return { results, metrics, options };
}

const forbidden = () => new ApiRequestError("Sem permissão", 403, "PERMISSION_DENIED");

describe("useAdminResultsVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockClear();
    mockSearch = "";
    mockLocale = "pt";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("abre já filtrada pelo userId da URL e envia o filtro à listagem e ao resumo", async () => {
    mockSearch = "userId=1";
    const { results, metrics } = mockServices();

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });

    expect(result.current.filters.userId).toBe("1");
    expect(result.current.hasActiveFilters).toBe(true);

    await waitFor(() => expect(result.current.isResultsLoading).toBe(false));
    await waitFor(() => expect(result.current.totalResults).toBe(14));

    expect(results).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "1", search: "", page: 1, perPage: 6 }),
      expect.any(AbortSignal)
    );
    expect(metrics).toHaveBeenCalledWith(expect.objectContaining({ userId: "1" }), expect.any(AbortSignal));
    expect(result.current.results).toHaveLength(1);
    expect(result.current.summary.totalCompletedJourneys).toBe(4);
    expect(result.current.filteredTotal).toBe(4);
  });

  it("sem filtros, usa o total da própria listagem no contador e não pede o total sem filtros", async () => {
    const { metrics } = mockServices();

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isResultsLoading).toBe(false));
    await waitFor(() => expect(result.current.isSummaryLoading).toBe(false));

    expect(result.current.totalResults).toBe(4);
    expect(result.current.filteredTotal).toBe(4);
    expect(metrics).toHaveBeenCalledTimes(1);
  });

  it("consulta a API na hora ao mudar os filtros, volta para a página 1 e guarda os filtros na URL", async () => {
    const { results, metrics } = mockServices();

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isResultsLoading).toBe(false));

    act(() => result.current.handlePageChange(2));
    expect(mockReplace).toHaveBeenLastCalledWith("/admin/resultados?page=2", { scroll: false });

    act(() => result.current.handleUserChange("1"));
    expect(result.current.page).toBe(1);
    expect(mockReplace).toHaveBeenLastCalledWith("/admin/resultados?userId=1", { scroll: false });

    act(() => result.current.handleDepartmentChange("Jurídico"));
    act(() => result.current.handleToggleDomain("privacy"));
    act(() => result.current.handleToggleDomain("joint"));
    act(() => result.current.handleProfileChange("6"));
    act(() => result.current.handleDateFromChange("2026-05-01"));
    act(() => result.current.handleDateToChange("2026-05-31"));

    const expectedFilters = {
      userId: "1",
      department: "Jurídico",
      domains: ["privacy", "joint"],
      journeyProfileId: "6",
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31",
    };
    await waitFor(() =>
      expect(results).toHaveBeenLastCalledWith(
        expect.objectContaining({ ...expectedFilters, page: 1 }),
        expect.any(AbortSignal)
      )
    );
    expect(metrics).toHaveBeenCalledWith(expect.objectContaining(expectedFilters), expect.any(AbortSignal));
    expect(mockReplace).toHaveBeenLastCalledWith(
      "/admin/resultados?userId=1&department=Jur%C3%ADdico&domains=privacy%2Cjoint&journeyProfileId=6&dateFrom=2026-05-01&dateTo=2026-05-31",
      { scroll: false }
    );
  });

  it("espera 400 ms depois da última tecla e envia a busca sem os espaços das pontas", async () => {
    vi.useFakeTimers();
    const { results } = mockServices();

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    results.mockClear();

    act(() => result.current.handleSearchChange("  an"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    act(() => result.current.handleSearchChange("  ana "));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    // A segunda tecla recomeçou a espera, e o campo continua com o texto digitado
    expect(results).not.toHaveBeenCalled();
    expect(result.current.filters.search).toBe("  ana ");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    expect(results).toHaveBeenCalledTimes(1);
    expect(results).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "ana", page: 1 }),
      expect.any(AbortSignal)
    );
  });

  it("busca só com espaços não consulta de novo e lista tudo", async () => {
    vi.useFakeTimers();
    const { results } = mockServices();

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    results.mockClear();

    act(() => result.current.handleSearchChange("   "));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });

    expect(results).not.toHaveBeenCalled();
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.results).toHaveLength(1);
  });

  it("limpa todos os filtros, inclusive a URL", async () => {
    vi.useFakeTimers();
    mockServices();

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    act(() => result.current.handleSearchChange("ana"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });
    expect(mockReplace).toHaveBeenLastCalledWith("/admin/resultados?search=ana", { scroll: false });

    act(() => result.current.handleClearFilters());

    expect(result.current.filters.search).toBe("");
    expect(result.current.hasActiveFilters).toBe(false);
    expect(mockReplace).toHaveBeenLastCalledWith("/admin/resultados", { scroll: false });
  });

  it("mostra o erro só na listagem e tenta de novo só a listagem", async () => {
    const { results, metrics, options } = mockServices();
    results.mockRejectedValueOnce(new ApiRequestError("Erro", 500));

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isResultsError).toBe(true));
    expect(result.current.isSummaryError).toBe(false);
    expect(result.current.isFilterOptionsError).toBe(false);

    act(() => result.current.handleRetryResults());

    await waitFor(() => expect(result.current.isResultsError).toBe(false));
    expect(results).toHaveBeenCalledTimes(2);
    expect(metrics).toHaveBeenCalledTimes(1);
    expect(options).toHaveBeenCalledTimes(1);
  });

  it("mostra o erro só no resumo e tenta de novo só o resumo", async () => {
    const { results, metrics } = mockServices();
    metrics.mockRejectedValueOnce(new ApiRequestError("Erro", 500));

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSummaryError).toBe(true));
    expect(result.current.isResultsError).toBe(false);

    act(() => result.current.handleRetrySummary());

    await waitFor(() => expect(result.current.isSummaryError).toBe(false));
    expect(metrics).toHaveBeenCalledTimes(2);
    expect(results).toHaveBeenCalledTimes(1);
  });

  it("mostra o erro só nas opções dos filtros e tenta de novo só as opções", async () => {
    const { options } = mockServices();
    options.mockRejectedValueOnce(new ApiRequestError("Erro", 500));

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isFilterOptionsError).toBe(true));
    expect(result.current.isResultsError).toBe(false);
    expect(result.current.filterOptions.users).toEqual([]);

    act(() => result.current.handleRetryFilterOptions());

    await waitFor(() => expect(result.current.isFilterOptionsError).toBe(false));
    expect(options).toHaveBeenCalledTimes(2);
    expect(result.current.filterOptions.users).toHaveLength(1);
  });

  it("leva à página de acesso negado quando a API responde 403", async () => {
    const { results, metrics, options } = mockServices();
    results.mockRejectedValue(forbidden());
    metrics.mockRejectedValue(forbidden());
    options.mockRejectedValue(forbidden());

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/painel?error=access_denied"));
    expect(result.current.isResultsError).toBe(false);
    expect(result.current.isSummaryError).toBe(false);
    expect(result.current.isFilterOptionsError).toBe(false);
  });

  it("cancela a consulta anterior quando um filtro muda antes da resposta", async () => {
    const signals: AbortSignal[] = [];
    mockServices().results.mockImplementation(
      (_params, signal) =>
        new Promise((resolve) => {
          if (signal) signals.push(signal);
          if (signals.length > 1) resolve(resultsPage);
        })
    );

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });
    await waitFor(() => expect(signals).toHaveLength(1));

    act(() => result.current.handleUserChange("1"));

    await waitFor(() => expect(signals).toHaveLength(2));
    expect(signals[0].aborted).toBe(true);
    await waitFor(() => expect(result.current.results).toHaveLength(1));
  });

  it("traduz os nomes de perfis e domínios conforme o idioma", async () => {
    mockLocale = "en";
    mockServices();

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.results).toHaveLength(1));
    await waitFor(() => expect(result.current.filterOptions.domains).toHaveLength(2));

    expect(result.current.results[0].profileTitle).toBe("Compliance and Security Auditor");
    expect(result.current.results[0].domainLabel).toBe("Joint");
    expect(result.current.summary.domainAverages[0].label).toBe("Privacy");
    expect(result.current.filterOptions.domains[1].label).toBe("Information Security");
  });
});
