"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  getPendingAssessments,
  getCatalogAssessments,
} from "@services/assessmentsService";
import type {
  AssessmentsViewModelReturn,
  AssessmentsLabels,
  ServerMessage,
} from "./assessments.types";

function formatErrorMessage(err: unknown, defaultMsg: string): string {
  if (err instanceof Error) {
    if (
      err.message.includes("Failed to fetch") ||
      err.message.includes("NetworkError") ||
      err.message.includes("fetch failed")
    ) {
      return defaultMsg;
    }
    return err.message;
  }
  return defaultMsg;
}

export function useAssessmentsVM(): AssessmentsViewModelReturn {
  const t = useTranslations("assessments");

  // Pagination & Search States
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Dismissable banner message override
  const [dismissedBanner, setDismissedBanner] = useState<boolean>(false);

  // Debounce effect for search term (300ms)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
      setCatalogPage(1);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // TanStack Query - Pending Journeys
  const pendingQuery = useQuery({
    queryKey: ["assessments", "pending", pendingPage],
    queryFn: () => getPendingAssessments({ page: pendingPage, limit: 6 }),
    retry: false,
  });

  // TanStack Query - Catalog Journeys
  const catalogQuery = useQuery({
    queryKey: ["assessments", "catalog", catalogPage, debouncedSearchTerm],
    queryFn: () =>
      getCatalogAssessments({
        page: catalogPage,
        limit: 6,
        search: debouncedSearchTerm,
      }),
    retry: false,
  });

  const pendingJourneys = pendingQuery.data?.items ?? [];
  const pendingTotalPages = pendingQuery.data?.totalPages ?? 1;
  const isPendingLoading = pendingQuery.isLoading;
  const pendingError = pendingQuery.error
    ? formatErrorMessage(pendingQuery.error, t("errorMessage") || "Erro ao carregar jornadas pendentes.")
    : null;

  const catalogJourneys = catalogQuery.data?.items ?? [];
  const catalogTotalPages = catalogQuery.data?.totalPages ?? 1;
  const isCatalogLoading = catalogQuery.isLoading;
  const catalogError = catalogQuery.error
    ? formatErrorMessage(catalogQuery.error, t("errorMessage") || "Erro ao carregar catálogo de jornadas.")
    : null;

  // Pending section is visible if loading, has journeys, or failed with an error
  const isPendingSectionVisible =
    isPendingLoading || pendingJourneys.length > 0 || pendingError !== null;

  // Handle Page Changes
  const handlePendingPageChange = (page: number) => {
    setPendingPage(page);
  };

  const handleCatalogPageChange = (page: number) => {
    setCatalogPage(page);
  };

  const handleRetryPending = () => {
    void pendingQuery.refetch();
  };

  const handleRetryCatalog = () => {
    void catalogQuery.refetch();
  };

  const handleRetry = () => {
    setDismissedBanner(false);
    void pendingQuery.refetch();
    void catalogQuery.refetch();
  };

  const onCloseMsg = () => {
    setDismissedBanner(true);
  };

  const labels: AssessmentsLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    pendingSectionTitle: t("pendingSectionTitle"),
    pendingSectionSubtitle: t("pendingSectionSubtitle"),
    pendingEmpty: t("pendingEmpty"),
    catalogSectionTitle: t("catalogSectionTitle"),
    catalogSectionSubtitle: t("catalogSectionSubtitle"),
    catalogSearchPlaceholder: t("catalogSearchPlaceholder"),
    catalogEmpty: t("catalogEmpty"),
    statusCompleted: t("statusCompleted"),
    statusInProgress: t("statusInProgress"),
    statusNotStarted: t("statusNotStarted"),
    actionStart: t("actionStart"),
    actionContinue: t("actionContinue"),
    actionRetake: t("actionRetake"),
    questionsCount: (count: number) => t("questionsCount", { count }),
    estimatedMinutes: (minutes: number) => t("estimatedMinutes", { minutes }),
    paginationPrevious: t("pagination.previous"),
    paginationNext: t("pagination.next"),
    paginationPageOf: (current: number, total: number) =>
      t("pagination.pageOf", { current, total }),
    errorTitle: t("errorTitle"),
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
    loadingAriaLabel: t("loadingAriaLabel"),
  };

  const isLoading = isPendingLoading && isCatalogLoading;
  const globalError = !dismissedBanner ? (pendingError || catalogError) : null;
  const serverMessage: ServerMessage | null = globalError
    ? {
        title: labels.errorTitle,
        description: globalError,
        variant: "destructive",
      }
    : null;

  return {
    pendingJourneys,
    pendingPage,
    pendingTotalPages,
    isPendingLoading,
    pendingError,
    isPendingSectionVisible,
    handlePendingPageChange,
    handleRetryPending,

    catalogJourneys,
    catalogPage,
    catalogTotalPages,
    isCatalogLoading,
    catalogError,
    searchTerm,
    handleSearchChange,
    handleCatalogPageChange,
    handleRetryCatalog,

    isLoading,
    error: globalError,
    serverMessage,
    onCloseMsg,
    handleRetry,
    labels,
  };
}
