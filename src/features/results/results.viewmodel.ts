"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@hooks/useAuth";
import { getMetrics, getResultsList } from "@services/resultsService";
import type {
  ResultsViewModelReturn,
  ResultsLabels,
  ServerMessage,
  ResultsEmptyStateMode,
  ResultsFilters,
  JourneyDomain,
  ResultsMetrics,
} from "./results.types";

function formatErrorMessage(err: unknown, defaultMsg: string): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (
      msg.includes("could not be found") ||
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("fetch failed") ||
      msg.startsWith("The route") ||
      msg.includes("404") ||
      msg.includes("500") ||
      msg.includes("Internal Server Error")
    ) {
      return defaultMsg;
    }
    return msg;
  }
  return defaultMsg;
}

function getDomainLabel(
  domain: string | null | undefined,
  namePt: string | undefined,
  nameEn: string | undefined,
  fallbackLabel: string | undefined,
  locale: string,
  t: (key: string) => string
): string {
  if (locale === "en" && nameEn) return nameEn;
  if (locale !== "en" && namePt) return namePt;
  if (domain === "privacy") return t("filterDomainPrivacy");
  if (domain === "security") return t("filterDomainSecurity");
  if (domain === "joint") return t("filterDomainJoint");
  return fallbackLabel || domain || "";
}

export function useResultsVM(): ResultsViewModelReturn {
  const t = useTranslations("results");
  const locale = useLocale();
  const { user } = useAuth();
  // O layout autenticado só renderiza a tela com o usuário carregado; sem ele,
  // as consultas esperam em vez de buscar os dados de outro usuário
  const userId = user?.id;

  // Pagination & Search States
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Filters State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<ResultsFilters>({ domains: [] });

  // Dismissed banner state
  const [dismissedBanner, setDismissedBanner] = useState<boolean>(false);

  // Debounce for search input (400ms)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
      setPage(1);
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleToggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen((prev) => !prev);
  }, []);

  const handleToggleDomainFilter = useCallback((domain: JourneyDomain) => {
    setFilters((prev) => {
      const exists = prev.domains.includes(domain);
      const newDomains = exists
        ? prev.domains.filter((d) => d !== domain)
        : [...prev.domains, domain];
      return { ...prev, domains: newDomains };
    });
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ domains: [] });
    setPage(1);
  }, []);

  // TanStack Query - Metrics
  const metricsQuery = useQuery({
    queryKey: ["results", "metrics", userId],
    queryFn: () => getMetrics(userId as number),
    enabled: userId != null,
    retry: false,
  });

  // TanStack Query - Results List
  const resultsQuery = useQuery({
    queryKey: [
      "results",
      "list",
      userId,
      page,
      debouncedSearchTerm,
      filters.domains.join(","),
    ],
    queryFn: () =>
      getResultsList({
        userId: userId as number,
        page,
        per_page: 6,
        search: debouncedSearchTerm,
        domains: filters.domains,
      }),
    enabled: userId != null,
    retry: false,
  });

  const rawMetrics = metricsQuery.data ?? null;
  const metrics: ResultsMetrics | null = rawMetrics
    ? {
        ...rawMetrics,
        domainMetrics: (rawMetrics.domainMetrics ?? []).map((dm) => ({
          ...dm,
          label: getDomainLabel(
            dm.domain,
            dm.namePt,
            dm.nameEn,
            dm.label,
            locale,
            t
          ),
        })),
      }
    : null;

  const isMetricsLoading = metricsQuery.isLoading;
  const isMetricsError = metricsQuery.isError;
  const metricsError = metricsQuery.error
    ? formatErrorMessage(
        metricsQuery.error,
        t("errorMetricsMessage") || "Erro ao carregar estatísticas de resultados."
      )
    : null;

  const rawResults = resultsQuery.data?.items ?? [];
  const results = rawResults.map((item) => {
    const title =
      locale === "en"
        ? item.nameEn || item.title
        : item.namePt || item.title;

    const domainLabel = getDomainLabel(
      item.domain,
      item.domainNamePt,
      item.domainNameEn,
      item.domainLabel,
      locale,
      t
    );

    return {
      ...item,
      title,
      domainLabel,
    };
  });
  const totalPages = resultsQuery.data?.totalPages ?? 1;
  const isResultsLoading = resultsQuery.isLoading;
  const isResultsError = resultsQuery.isError;
  const resultsError = resultsQuery.error
    ? formatErrorMessage(resultsQuery.error, t("errorMessage"))
    : null;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRetry = () => {
    setDismissedBanner(false);
    void metricsQuery.refetch();
    void resultsQuery.refetch();
  };

  const onCloseMsg = () => {
    setDismissedBanner(true);
  };

  const formatCompletedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return t("completedAt", { date: dateStr });
      }
      const day = String(date.getUTCDate()).padStart(2, "0");
      const monthIndex = date.getUTCMonth();
      const year = date.getUTCFullYear();

      const MONTHS_PT = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
      ];
      const MONTHS_EN = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const formatted =
        locale === "en"
          ? `${MONTHS_EN[monthIndex]} ${day}, ${year}`
          : `${day} de ${MONTHS_PT[monthIndex]} de ${year}`;

      return t("completedAt", { date: formatted });
    } catch {
      return t("completedAt", { date: dateStr });
    }
  };

  const labels: ResultsLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    kpiTotalCompleted: t("kpiTotalCompleted"),
    kpiAverageScore: t("kpiAverageScore"),
    kpiDomainScore: (score: number) => t("kpiDomainScore", { score }),
    kpiEmptyScore: t("kpiEmptyScore"),
    sectionTitle: t("sectionTitle"),
    sectionSubtitle: t("sectionSubtitle"),
    searchPlaceholder: t("searchPlaceholder"),
    searchEmptyTitle: t("searchEmptyTitle"),
    searchEmpty: t("searchEmpty"),
    userEmptyTitle: t("userEmptyTitle"),
    userEmpty: t("userEmpty"),
    availableJourneysCta: t("availableJourneysCta"),
    completedAt: formatCompletedDate,
    completedScoreTag: (score: number) => t("completedScoreTag", { score }),
    questionsCount: (count: number) => t("questionsCount", { count }),
    viewResult: t("viewResult"),
    filtersButton: t("filtersButton"),
    filtersButtonWithCount: (count: number) =>
      t("filtersButtonWithCount", { count }),
    filtersTitle: t("filtersTitle"),
    filtersDomainTitle: t("filtersDomainTitle"),
    filtersClear: t("filtersClear"),
    filterDomainPrivacy: t("filterDomainPrivacy"),
    filterDomainSecurity: t("filterDomainSecurity"),
    filterDomainJoint: t("filterDomainJoint"),
    paginationPrevious: t("pagination.previous"),
    paginationNext: t("pagination.next"),
    paginationPageOf: (current: number, total: number) =>
      t("pagination.pageOf", { current, total }),
    errorTitle: t("errorTitle"),
    errorMetricsMessage: t("errorMetricsMessage"),
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
    loadingAriaLabel: t("loadingAriaLabel"),
    scoreAriaLabel: (score: number) => t("scoreAriaLabel", { score }),
  };

  const isLoading = isMetricsLoading || isResultsLoading;
  const rawError = !dismissedBanner ? metricsError || resultsError : null;
  const serverMessage: ServerMessage | null = rawError
    ? {
        title: labels.errorTitle,
        description: rawError,
        variant: "destructive",
      }
    : null;

  // Compute empty state mode in ViewModel
  const isFilterActive =
    debouncedSearchTerm.trim().length > 0 || filters.domains.length > 0;
  const hasNoResults =
    !isResultsLoading && !isResultsError && results.length === 0;

  let emptyState: ResultsEmptyStateMode = "none";
  if (hasNoResults) {
    emptyState = isFilterActive ? "no-search-matches" : "no-results";
  }

  return {
    metrics,
    isMetricsLoading,
    isMetricsError,

    results,
    page,
    totalPages,
    isResultsLoading,
    isResultsError,
    resultsErrorMessage: resultsError,
    emptyState,

    searchTerm,
    handleSearchChange,
    handlePageChange,

    isFilterPanelOpen,
    handleToggleFilterPanel,
    activeFiltersCount: filters.domains.length,
    filters,
    handleToggleDomainFilter,
    handleClearFilters,

    isLoading,
    error: rawError,
    serverMessage,
    onCloseMsg,
    handleRetry,
    labels,
  };
}
