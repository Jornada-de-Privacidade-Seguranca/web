"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "@shared/i18n/navigation";
import { ApiRequestError } from "@services/httpClient";
import {
  getAdminResults,
  getAdminResultsFilterOptions,
  getAdminResultsMetrics,
} from "@services/adminResultsService";
import {
  EMPTY_ADMIN_RESULTS_FILTERS,
  formatAdminResultDate,
  hasActiveAdminResultsFilters,
  parseAdminResultsSearchParams,
  serializeAdminResultsSearchParams,
} from "./adminResults.utils";
import type {
  AdminResultsFilterOptions,
  AdminResultsFilterParams,
  AdminResultsFilters,
  AdminResultsLabels,
  AdminResultsSummary,
  AdminResultsViewModelReturn,
  JourneyDomain,
  ScoreBand,
} from "./adminResults.types";

const DEFAULT_PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 400;
const ACCESS_DENIED_ROUTE = "/painel?error=access_denied";

const EMPTY_SUMMARY: AdminResultsSummary = {
  totalCompletedJourneys: 0,
  totalEvaluatedUsers: 0,
  domainAverages: [],
};

const EMPTY_FILTER_OPTIONS: AdminResultsFilterOptions = {
  users: [],
  departments: [],
  domains: [],
  journeyProfiles: [],
};

export function useAdminResultsVM(): AdminResultsViewModelReturn {
  const t = useTranslations("adminResults");
  const locale = useLocale();
  const isEnglish = locale === "en";
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialParsed = useMemo(
    () => parseAdminResultsSearchParams(searchParams),
    // Inicialização única na montagem; navegações posteriores são tratadas pelo efeito abaixo
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [filters, setFilters] = useState<AdminResultsFilters>(initialParsed.filters);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialParsed.filters.search);
  const [page, setPage] = useState<number>(initialParsed.page);

  const filtersRef = useRef<AdminResultsFilters>(initialParsed.filters);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSearchParamsRef = useRef<string>(searchParams.toString());
  const lastDesiredUrlRef = useRef<string>(searchParams.toString());
  const pendingUrlsRef = useRef<Set<string>>(new Set());

  const syncUrl = useCallback(
    (nextFilters: AdminResultsFilters, nextPage: number) => {
      const qs = serializeAdminResultsSearchParams(nextFilters, nextPage);
      if (qs === lastDesiredUrlRef.current) return;
      lastDesiredUrlRef.current = qs;
      pendingUrlsRef.current.add(qs);
      const target = qs ? `${pathname}?${qs}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router]
  );

  // Mantém estado sincronizado com navegações externas (voltar/avançar ou links com ?userId=...)
  const currentSearchParamsString = searchParams.toString();
  useEffect(() => {
    if (currentSearchParamsString === prevSearchParamsRef.current) return;
    prevSearchParamsRef.current = currentSearchParamsString;

    if (pendingUrlsRef.current.has(currentSearchParamsString)) {
      pendingUrlsRef.current.delete(currentSearchParamsString);
      return;
    }

    pendingUrlsRef.current.clear();
    lastDesiredUrlRef.current = currentSearchParamsString;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const parsed = parseAdminResultsSearchParams(new URLSearchParams(currentSearchParamsString));
    filtersRef.current = parsed.filters;
    setFilters(parsed.filters);
    setDebouncedSearch(parsed.filters.search);
    setPage(parsed.page);
  }, [currentSearchParamsString]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const updateFilter = useCallback(
    (updater: (prev: AdminResultsFilters) => AdminResultsFilters) => {
      const next = updater(filtersRef.current);
      filtersRef.current = next;
      setFilters(next);
      setPage(1);
      syncUrl({ ...next, search: debouncedSearch }, 1);
    },
    [debouncedSearch, syncUrl]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      const next = { ...filtersRef.current, search };
      filtersRef.current = next;
      setFilters(next);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const synced = { ...filtersRef.current, search };
        setDebouncedSearch(search);
        setPage(1);
        syncUrl(synced, 1);
      }, SEARCH_DEBOUNCE_MS);
    },
    [syncUrl]
  );

  const handleUserChange = useCallback(
    (userId: string) => {
      updateFilter((prev) => ({ ...prev, userId }));
    },
    [updateFilter]
  );

  const handleDepartmentChange = useCallback(
    (department: string) => {
      updateFilter((prev) => ({ ...prev, department }));
    },
    [updateFilter]
  );

  const handleToggleDomain = useCallback(
    (domain: JourneyDomain) => {
      updateFilter((prev) => {
        const exists = prev.domains.includes(domain);
        const domains = exists
          ? prev.domains.filter((item) => item !== domain)
          : [...prev.domains, domain];
        return { ...prev, domains };
      });
    },
    [updateFilter]
  );

  const handleProfileChange = useCallback(
    (journeyProfileId: string) => {
      updateFilter((prev) => ({ ...prev, journeyProfileId }));
    },
    [updateFilter]
  );

  const handleDateFromChange = useCallback(
    (dateFrom: string) => {
      updateFilter((prev) => ({ ...prev, dateFrom }));
    },
    [updateFilter]
  );

  const handleDateToChange = useCallback(
    (dateTo: string) => {
      updateFilter((prev) => ({ ...prev, dateTo }));
    },
    [updateFilter]
  );

  const handleClearFilters = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    filtersRef.current = EMPTY_ADMIN_RESULTS_FILTERS;
    setFilters(EMPTY_ADMIN_RESULTS_FILTERS);
    setDebouncedSearch("");
    setPage(1);
    syncUrl(EMPTY_ADMIN_RESULTS_FILTERS, 1);
  }, [syncUrl]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      syncUrl({ ...filtersRef.current, search: debouncedSearch }, newPage);
    },
    [debouncedSearch, syncUrl]
  );

  // Filtros que vão para a API: a busca só entra depois do debounce, sem os espaços das pontas
  const appliedFilters: AdminResultsFilterParams = useMemo(
    () => ({
      search: debouncedSearch.trim(),
      userId: filters.userId,
      department: filters.department,
      domains: filters.domains,
      journeyProfileId: filters.journeyProfileId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [
      debouncedSearch,
      filters.userId,
      filters.department,
      filters.domains,
      filters.journeyProfileId,
      filters.dateFrom,
      filters.dateTo,
    ]
  );
  const appliedFiltersKey = [
    appliedFilters.search,
    appliedFilters.userId,
    appliedFilters.department,
    (appliedFilters.domains ?? []).join(","),
    appliedFilters.journeyProfileId,
    appliedFilters.dateFrom,
    appliedFilters.dateTo,
  ];
  const hasAppliedFilters = hasActiveAdminResultsFilters({
    ...filters,
    search: appliedFilters.search ?? "",
  });

  // Cada mudança de filtro gera uma chave nova. O React Query cancela a consulta
  // anterior pelo `signal`, e uma resposta atrasada não substitui a mais recente.
  const resultsQuery = useQuery({
    queryKey: ["admin", "results", "list", page, ...appliedFiltersKey],
    queryFn: ({ signal }) =>
      getAdminResults({ ...appliedFilters, page, perPage: DEFAULT_PAGE_SIZE }, signal),
    placeholderData: keepPreviousData,
    retry: false,
  });

  const metricsQuery = useQuery({
    queryKey: ["admin", "results", "metrics", ...appliedFiltersKey],
    queryFn: ({ signal }) => getAdminResultsMetrics(appliedFilters, signal),
    placeholderData: keepPreviousData,
    retry: false,
  });

  // Total sem filtros, para o "y" do contador. Sem filtros, é o próprio total da listagem.
  const unfilteredTotalQuery = useQuery({
    queryKey: ["admin", "results", "metrics", "unfiltered"],
    queryFn: ({ signal }) => getAdminResultsMetrics({}, signal),
    enabled: hasAppliedFilters,
    retry: false,
  });

  const filterOptionsQuery = useQuery({
    queryKey: ["admin", "results", "filter-options"],
    queryFn: ({ signal }) => getAdminResultsFilterOptions(signal),
    staleTime: Infinity,
    retry: false,
  });

  // Sem a permissão results.view_all a API responde 403: leva à página de acesso negado
  const isForbidden = [
    resultsQuery.error,
    metricsQuery.error,
    unfilteredTotalQuery.error,
    filterOptionsQuery.error,
  ].some((error) => error instanceof ApiRequestError && error.status === 403);

  useEffect(() => {
    if (isForbidden) {
      router.replace(ACCESS_DENIED_ROUTE);
    }
  }, [isForbidden, router]);

  const summary: AdminResultsSummary = useMemo(() => {
    const raw = metricsQuery.data ?? EMPTY_SUMMARY;
    return {
      totalCompletedJourneys: raw.totalCompletedJourneys,
      totalEvaluatedUsers: raw.totalEvaluatedUsers,
      domainAverages: raw.domainAverages.map((dm) => ({
        ...dm,
        label: isEnglish ? dm.nameEn || dm.label : dm.namePt || dm.label,
      })),
    };
  }, [isEnglish, metricsQuery.data]);

  const filterOptions: AdminResultsFilterOptions = useMemo(() => {
    const raw = filterOptionsQuery.data ?? EMPTY_FILTER_OPTIONS;
    return {
      users: raw.users,
      departments: raw.departments,
      domains: raw.domains.map((domain) => ({
        ...domain,
        label: isEnglish ? domain.nameEn || domain.label : domain.namePt || domain.label,
      })),
      journeyProfiles: raw.journeyProfiles.map((profile) => ({
        ...profile,
        label: isEnglish ? profile.nameEn || profile.label : profile.namePt || profile.label,
      })),
    };
  }, [filterOptionsQuery.data, isEnglish]);

  const results = useMemo(() => {
    const items = resultsQuery.data?.items ?? [];
    return items.map((item) => ({
      ...item,
      profileTitle: isEnglish
        ? item.profileNameEn || item.profileTitle
        : item.profileNamePt || item.profileTitle,
      domainLabel: isEnglish
        ? item.domainNameEn || item.domainLabel
        : item.domainNamePt || item.domainLabel,
    }));
  }, [isEnglish, resultsQuery.data?.items]);

  const { refetch: refetchResults } = resultsQuery;
  const { refetch: refetchMetrics } = metricsQuery;
  const { refetch: refetchUnfilteredTotal } = unfilteredTotalQuery;
  const { refetch: refetchFilterOptions } = filterOptionsQuery;

  const handleRetryResults = useCallback(() => {
    void refetchResults();
  }, [refetchResults]);

  const handleRetrySummary = useCallback(() => {
    void refetchMetrics();
    if (hasAppliedFilters) void refetchUnfilteredTotal();
  }, [hasAppliedFilters, refetchMetrics, refetchUnfilteredTotal]);

  const handleRetryFilterOptions = useCallback(() => {
    void refetchFilterOptions();
  }, [refetchFilterOptions]);

  const hasActiveFilters = hasActiveAdminResultsFilters(filters);
  const filteredTotal = resultsQuery.data?.total ?? 0;
  const totalResults = hasAppliedFilters
    ? (unfilteredTotalQuery.data?.totalCompletedJourneys ?? filteredTotal)
    : filteredTotal;

  const labels: AdminResultsLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    summaryAriaLabel: t("summary.ariaLabel"),
    summaryTotalCompleted: t("summary.totalCompleted"),
    summaryTotalUsers: t("summary.totalUsers"),
    summaryDomainScore: (score: number) => t("summary.domainScore", { score }),
    summaryEmptyScore: t("summary.emptyScore"),
    filtersAriaLabel: t("filters.ariaLabel"),
    searchPlaceholder: t("filters.searchPlaceholder"),
    filterUser: t("filters.user"),
    filterAllUsers: t("filters.allUsers"),
    filterDepartment: t("filters.department"),
    filterAllDepartments: t("filters.allDepartments"),
    filterProfile: t("filters.profile"),
    filterAllProfiles: t("filters.allProfiles"),
    filterDomains: t("filters.domains"),
    filterDateFrom: t("filters.dateFrom"),
    filterDateTo: t("filters.dateTo"),
    filterClear: t("filters.clear"),
    filterCounter: (filtered: number, total: number) =>
      t("filters.counter", { filtered, total }),
    tableUser: t("table.user"),
    tableDepartment: t("table.department"),
    tableProfile: t("table.profile"),
    tableDomain: t("table.domain"),
    tableCompletedAt: t("table.completedAt"),
    tableScore: t("table.score"),
    tableActions: t("table.actions"),
    tableView: t("table.view"),
    tableEmptyDepartment: t("table.emptyDepartment"),
    scoreValue: (score: number) => t("table.scoreValue", { score }),
    scoreBandLabel: (band: ScoreBand) => t(`bands.${band}`),
    scoreAriaLabel: (score: number, band: ScoreBand) =>
      t("table.scoreAriaLabel", { score, band: t(`bands.${band}`) }),
    formatDate: (isoDate: string) => formatAdminResultDate(isoDate, locale),
    emptyTitle: t("empty.title"),
    emptyDescription: t("empty.description"),
    emptyNoDataTitle: t("empty.noDataTitle"),
    emptyNoDataDescription: t("empty.noDataDescription"),
    emptyClearButton: t("empty.clearButton"),
    paginationPrevious: t("pagination.previous"),
    paginationNext: t("pagination.next"),
    paginationPageOf: (current: number, total: number) =>
      t("pagination.pageOf", { current, total }),
    errorTitle: t("error.title"),
    errorMessage: t("error.message"),
    summaryErrorMessage: t("error.summaryMessage"),
    filterOptionsErrorMessage: t("error.filterOptionsMessage"),
    retryButton: t("error.retry"),
    loadingAriaLabel: t("loadingAriaLabel"),
  };

  return {
    summary,
    results,
    listQuery: currentSearchParamsString,
    totalResults,
    filteredTotal,
    page: resultsQuery.data?.page ?? page,
    totalPages: resultsQuery.data?.totalPages ?? 1,
    isResultsLoading: resultsQuery.isLoading,
    isResultsError: resultsQuery.isError && !isForbidden,
    isSummaryLoading: metricsQuery.isLoading,
    isSummaryError: metricsQuery.isError && !isForbidden,
    isFilterOptionsLoading: filterOptionsQuery.isLoading,
    isFilterOptionsError: filterOptionsQuery.isError && !isForbidden,
    hasActiveFilters,
    filters,
    filterOptions,
    handleSearchChange,
    handleUserChange,
    handleDepartmentChange,
    handleToggleDomain,
    handleProfileChange,
    handleDateFromChange,
    handleDateToChange,
    handleClearFilters,
    handlePageChange,
    handleRetryResults,
    handleRetrySummary,
    handleRetryFilterOptions,
    labels,
  };
}
