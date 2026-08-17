"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@features/auth/auth.store";
import {
  getPendingAssessments,
  getCatalogAssessments,
} from "@services/AssessmentsService";
import type {
  Journey,
  AssessmentsViewModelReturn,
  AssessmentsLabels,
  ServerMessage,
} from "./assessments.types";

export function useAssessmentsVM(): AssessmentsViewModelReturn {
  const t = useTranslations("assessments");
  const userToken = useAuthStore((state) => state.token) ?? undefined;

  // Pending State
  const [pendingJourneys, setPendingJourneys] = useState<Journey[]>([]);
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [pendingTotalPages, setPendingTotalPages] = useState<number>(1);
  const [isPendingLoading, setIsPendingLoading] = useState<boolean>(true);

  // Catalog State
  const [catalogJourneys, setCatalogJourneys] = useState<Journey[]>([]);
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState<number>(1);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Error State
  const [error, setError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<ServerMessage | null>(null);

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

  // Fetch Pending Journeys
  const fetchPending = useCallback(
    async (page: number) => {
      setIsPendingLoading(true);
      try {
        const response = await getPendingAssessments(
          { page, limit: 6 },
          userToken
        );
        setPendingJourneys(response.items || []);
        setPendingTotalPages(response.totalPages || 1);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("errorMessage") || "Erro ao carregar jornadas pendentes.";
        setError(message);
        setServerMessage({
          title: t("errorTitle"),
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsPendingLoading(false);
      }
    },
    [userToken, t]
  );

  // Fetch Catalog Journeys
  const fetchCatalog = useCallback(
    async (page: number, search: string) => {
      setIsCatalogLoading(true);
      try {
        const response = await getCatalogAssessments(
          { page, limit: 6, search },
          userToken
        );
        setCatalogJourneys(response.items || []);
        setCatalogTotalPages(response.totalPages || 1);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("errorMessage") || "Erro ao carregar catálogo de jornadas.";
        setError(message);
        setServerMessage({
          title: t("errorTitle"),
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsCatalogLoading(false);
      }
    },
    [userToken, t]
  );

  // Trigger pending fetch when pendingPage changes
  useEffect(() => {
    queueMicrotask(() => {
      void fetchPending(pendingPage);
    });
  }, [fetchPending, pendingPage]);

  // Trigger catalog fetch when catalogPage or debouncedSearchTerm changes
  useEffect(() => {
    queueMicrotask(() => {
      void fetchCatalog(catalogPage, debouncedSearchTerm);
    });
  }, [fetchCatalog, catalogPage, debouncedSearchTerm]);

  const handlePendingPageChange = (page: number) => {
    setPendingPage(page);
  };

  const handleCatalogPageChange = (page: number) => {
    setCatalogPage(page);
  };

  const onCloseMsg = () => {
    setError(null);
    setServerMessage(null);
  };

  const handleRetry = () => {
    onCloseMsg();
    fetchPending(pendingPage);
    fetchCatalog(catalogPage, debouncedSearchTerm);
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
  const isPendingSectionVisible = isPendingLoading || pendingJourneys.length > 0;

  return {
    pendingJourneys,
    pendingPage,
    pendingTotalPages,
    isPendingLoading,
    isPendingSectionVisible,
    handlePendingPageChange,

    catalogJourneys,
    catalogPage,
    catalogTotalPages,
    isCatalogLoading,
    searchTerm,
    handleSearchChange,
    handleCatalogPageChange,

    isLoading,
    error,
    serverMessage,
    onCloseMsg,
    handleRetry,
    labels,
  };
}
