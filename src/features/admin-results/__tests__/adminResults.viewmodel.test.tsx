// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as adminResultsService from "@services/adminResultsService";
import { useAdminResultsVM } from "../adminResults.viewmodel";
import type { AdminResultsResponse } from "../adminResults.types";

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

const mockResponse: AdminResultsResponse = {
  items: [
    {
      id: "ar-1",
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
      completedAt: "2026-06-08T14:20:00Z",
      score: 92,
      scoreBand: "strong",
    },
  ],
  total: 14,
  filteredTotal: 4,
  page: 1,
  limit: 6,
  totalPages: 2,
  summary: {
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
  },
  filterOptions: {
    users: [{ id: "1", name: "Ana Beatriz Silva", email: "ana.silva@empresa.com" }],
    departments: ["Tecnologia da Informação"],
    domains: [
      { id: "privacy", namePt: "Privacidade", nameEn: "Privacy", label: "Privacidade" },
      { id: "security", namePt: "Segurança da Informação", nameEn: "Information Security", label: "Segurança da Informação" },
    ],
    journeyProfiles: [
      {
        id: "6",
        namePt: "Auditor de Conformidade e Segurança",
        nameEn: "Compliance and Security Auditor",
        label: "Auditor de Conformidade e Segurança",
      },
    ],
  },
};

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

  it("deve abrir já filtrada quando a URL contiver o parâmetro userId", async () => {
    mockSearch = "userId=1";
    const spy = vi.spyOn(adminResultsService, "getAdminResults").mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });

    expect(result.current.filters.userId).toBe("1");
    expect(result.current.hasActiveFilters).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ userId: "1", page: 1 }));
    expect(result.current.results).toHaveLength(1);
    expect(result.current.summary.totalCompletedJourneys).toBe(4);
    expect(result.current.labels.filterCounter(4, 14)).toBe("4 de 14 resultados");
  });

  it("deve persistir filtros na URL e resetar para página 1", async () => {
    const spy = vi.spyOn(adminResultsService, "getAdminResults").mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

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

    await waitFor(() =>
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          userId: "1",
          department: "Jurídico",
          domains: ["privacy", "joint"],
          journeyProfileId: "6",
          dateFrom: "2026-05-01",
          dateTo: "2026-05-31",
          page: 1,
        })
      )
    );

    expect(mockReplace).toHaveBeenLastCalledWith(
      "/admin/resultados?userId=1&department=Jur%C3%ADdico&domains=privacy%2Cjoint&journeyProfileId=6&dateFrom=2026-05-01&dateTo=2026-05-31",
      { scroll: false }
    );
  });

  it("deve aplicar debounce na busca e limpar todos os filtros incluindo a URL", async () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(adminResultsService, "getAdminResults").mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    act(() => result.current.handleSearchChange("ana"));
    expect(result.current.filters.search).toBe("ana");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });

    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ search: "ana" }));
    expect(mockReplace).toHaveBeenLastCalledWith("/admin/resultados?search=ana", { scroll: false });

    act(() => result.current.handleClearFilters());

    expect(result.current.filters.search).toBe("");
    expect(result.current.hasActiveFilters).toBe(false);
    expect(mockReplace).toHaveBeenLastCalledWith("/admin/resultados", { scroll: false });
  });

  it("deve traduzir nomes de perfis e domínios conforme idioma e permitir nova tentativa em erro", async () => {
    mockLocale = "en";
    const spy = vi
      .spyOn(adminResultsService, "getAdminResults")
      .mockRejectedValueOnce(new Error("Erro"))
      .mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAdminResultsVM(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe("error.message");

    act(() => result.current.handleRetry());

    await waitFor(() => expect(result.current.isError).toBe(false));
    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.current.results[0].profileTitle).toBe("Compliance and Security Auditor");
    expect(result.current.results[0].domainLabel).toBe("Joint");
    expect(result.current.summary.domainAverages[0].label).toBe("Privacy");
  });
});

