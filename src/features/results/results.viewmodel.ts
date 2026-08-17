"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@features/auth/auth.store";
import { getMetrics, getResultsList } from "@services/ResultsService";
import type {
  ResultItem,
  ResultsMetrics,
  ResultsViewModelReturn,
  ResultsLabels,
  ServerMessage,
} from "./results.types";

export function useResultsVM(): ResultsViewModelReturn {
  const t = useTranslations("results");
  const userToken = useAuthStore((state) => state.token) ?? undefined;

  // Metrics State
  const [metrics, setMetrics] = useState<ResultsMetrics | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState<boolean>(true);

  // Results List State
  const [results, setResults] = useState<ResultItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isResultsLoading, setIsResultsLoading] = useState<boolean>(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Error State
  const [error, setError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<ServerMessage | null>(null);

  // Debounce for search input (300ms)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
      setPage(1);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch Metrics
  const fetchMetricsData = useCallback(async () => {
    setIsMetricsLoading(true);
    try {
      const data = await getMetrics(userToken);
      setMetrics(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("errorMessage") || "Erro ao carregar métricas de resultados.";
      setError(message);
      setServerMessage({
        title: t("errorTitle"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsMetricsLoading(false);
    }
  }, [userToken, t]);

  // Fetch Results List
  const fetchResultsData = useCallback(
    async (currentPage: number, search: string) => {
      setIsResultsLoading(true);
      try {
        const response = await getResultsList(
          { page: currentPage, limit: 6, search },
          userToken
        );
        setResults(response.items || []);
        setTotalPages(response.totalPages || 1);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("errorMessage") || "Erro ao carregar resultados de avaliações.";
        setError(message);
        setServerMessage({
          title: t("errorTitle"),
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsResultsLoading(false);
      }
    },
    [userToken, t]
  );

  // Initial fetch metrics
  useEffect(() => {
    queueMicrotask(() => {
      void fetchMetricsData();
    });
  }, [fetchMetricsData]);

  // Trigger results fetch on page or debounced search change
  useEffect(() => {
    queueMicrotask(() => {
      void fetchResultsData(page, debouncedSearchTerm);
    });
  }, [fetchResultsData, page, debouncedSearchTerm]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const onCloseMsg = () => {
    setError(null);
    setServerMessage(null);
  };

  const handleRetry = () => {
    onCloseMsg();
    fetchMetricsData();
    fetchResultsData(page, debouncedSearchTerm);
  };

  const formatCompletedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return t("completedAt", { date: dateStr });
      }
      const formatted = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
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
    searchEmpty: t("searchEmpty"),
    userEmpty: t("userEmpty"),
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

  return {
    metrics,
    isMetricsLoading,

    results,
    page,
    totalPages,
    isResultsLoading,
    searchTerm,
    handleSearchChange,
    handlePageChange,

    isLoading,
    error,
    serverMessage,
    onCloseMsg,
    handleRetry,
    labels,
  };
}
