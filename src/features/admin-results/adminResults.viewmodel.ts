"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "@shared/i18n/navigation";
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
  AdminResultsFilters,
  AdminResultsLabels,
  AdminResultsSummary,
  AdminResultsViewModelReturn,
  JourneyDomain,
  ScoreBand,
} from "./adminResults.types";

const DEFAULT_PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 400;

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

  // 1. Consulta dos resultados paginados (GET /admin/results)
  const resultsQuery = useQuery({
    queryKey: [
      "admin",
      "results",
      page,
      debouncedSearch,
      filters.userId,
      filters.department,
      filters.domains.join(","),
      filters.journeyProfileId,
      filters.dateFrom,
      filters.dateTo,
    ],
    queryFn: () =>
      getAdminResults({
        page,
        perPage: DEFAULT_PAGE_SIZE,
        search: debouncedSearch,
        userId: filters.userId,
        department: filters.department,
        domains: filters.domains,
        journeyProfileId: filters.journeyProfileId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
    placeholderData: keepPreviousData,
    retry: false,
  });

  // 2. Consulta das métricas agregadas por domínio (GET /admin/results/metrics)
  const metricsQuery = useQuery({
    queryKey: [
      "admin",
      "results-metrics",
      debouncedSearch,
      filters.userId,
      filters.department,
      filters.domains.join(","),
      filters.journeyProfileId,
      filters.dateFrom,
      filters.dateTo,
    ],
    queryFn: () =>
      getAdminResultsMetrics({
        search: debouncedSearch,
        userId: filters.userId,
        department: filters.department,
        domains: filters.domains,
        journeyProfileId: filters.journeyProfileId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
    placeholderData: keepPreviousData,
    retry: false,
  });

  // 3. Consulta das opções dos filtros (GET /users/with-results, GET /users/departments, GET /journey-profiles)
  const filterOptionsQuery = useQuery({
    queryKey: ["admin", "results-filter-options"],
    queryFn: getAdminResultsFilterOptions,
    staleTime: Infinity,
    retry: false,
  });

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

  const handleRetry = useCallback(() => {
    void resultsQuery.refetch();
    void metricsQuery.refetch();
    void filterOptionsQuery.refetch();
  }, [resultsQuery, metricsQuery, filterOptionsQuery]);

  const hasActiveFilters = hasActiveAdminResultsFilters(filters);
  const isLoading =
    resultsQuery.isLoading || metricsQuery.isLoading || filterOptionsQuery.isLoading;
  const isError =
    resultsQuery.isError || metricsQuery.isError || filterOptionsQuery.isError;

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
    retryButton: t("error.retry"),
    loadingAriaLabel: t("loadingAriaLabel"),
  };

  return {
    summary,
    results,
    listQuery: currentSearchParamsString,
    totalResults: resultsQuery.data?.total ?? 0,
    filteredTotal: resultsQuery.data?.filteredTotal ?? 0,
    page: resultsQuery.data?.page ?? page,
    totalPages: resultsQuery.data?.totalPages ?? 1,
    isLoading,
    isError,
    errorMessage: isError ? t("error.message") : null,
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
    handleRetry,
    labels,
  };
}
