"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getMetrics, getResultsList } from "@services/resultsService";
import type {
  ResultsViewModelReturn,
  ResultsLabels,
  ServerMessage,
  ResultsEmptyStateMode,
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

export function useResultsVM(): ResultsViewModelReturn {
  const t = useTranslations("results");
  const locale = useLocale();

  // Pagination & Search States
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

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

  // TanStack Query - Metrics
  const metricsQuery = useQuery({
    queryKey: ["results", "metrics"],
    queryFn: getMetrics,
    retry: false,
  });

  // TanStack Query - Results List
  const resultsQuery = useQuery({
    queryKey: ["results", "list", page, debouncedSearchTerm],
    queryFn: () => getResultsList({ page, limit: 6, search: debouncedSearchTerm }),
    retry: false,
  });

  const metrics = metricsQuery.data ?? null;
  const isMetricsLoading = metricsQuery.isLoading;
  const isMetricsError = metricsQuery.isError;
  const metricsError = metricsQuery.error
    ? formatErrorMessage(metricsQuery.error, t("errorMetricsMessage") || "Erro ao carregar estatísticas de resultados.")
    : null;

  const results = resultsQuery.data?.items ?? [];
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
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ];
      const MONTHS_EN = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
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
    sectionTitle: t("sectionTitle"),
    sectionSubtitle: t("sectionSubtitle"),
    searchPlaceholder: t("searchPlaceholder"),
    searchEmptyTitle: t("searchEmptyTitle"),
    searchEmpty: t("searchEmpty"),
    userEmptyTitle: t("userEmptyTitle"),
    userEmpty: t("userEmpty"),
    availableJourneysCta: t("availableJourneysCta"),
    completedAt: formatCompletedDate,
    questionsCount: (count: number) => t("questionsCount", { count }),
    viewResult: t("viewResult"),
    paginationPrevious: t("pagination.previous"),
    paginationNext: t("pagination.next"),
    paginationPageOf: (current: number, total: number) =>
      t("pagination.pageOf", { current, total }),
    errorTitle: t("errorTitle"),
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
    loadingAriaLabel: t("loadingAriaLabel"),
  };

  const isLoading = isMetricsLoading || isResultsLoading;
  const rawError = !dismissedBanner ? (metricsError || resultsError) : null;
  const serverMessage: ServerMessage | null = rawError
    ? {
        title: labels.errorTitle,
        description: rawError,
        variant: "destructive",
      }
    : null;

  // Compute empty state mode in ViewModel
  const isSearchActive = debouncedSearchTerm.trim().length > 0;
  const hasNoResults = !isResultsLoading && !isResultsError && results.length === 0;

  let emptyState: ResultsEmptyStateMode = "none";
  if (hasNoResults) {
    emptyState = isSearchActive ? "no-search-matches" : "no-results";
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
    emptyState,

    searchTerm,
    handleSearchChange,
    handlePageChange,

    isLoading,
    error: rawError,
    serverMessage,
    onCloseMsg,
    handleRetry,
    labels,
  };
}
