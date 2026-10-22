"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useJourneyContext } from "@hooks/useJourneyContext";
import { getJourneySummaryUrl } from "@shared/utils/journeyRoutes";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "@hooks/useAuth";
import {
  getPendingAssessments,
  getCatalogAssessments,
} from "@services/assessmentsService";
import type {
  AssessmentsViewModelReturn,
  AssessmentsLabels,
  Journey,
  PaginatedResponse,
} from "./assessments.types";

const PAGE_ERROR_TOAST_DURATION = 4000;

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

/** Normaliza para busca: sem acentos, em minúsculas e sem espaços nas pontas. */
function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useAssessmentsVM(): AssessmentsViewModelReturn {
  const t = useTranslations("assessments");
  const locale = useLocale() === "en" ? "en" : "pt";
  const currentJourney = useJourneyContext();
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  // Pagination & Search States
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Debounce effect for search term (300ms)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // A busca filtra apenas a página do catálogo já carregada (o backend não
    // tem busca por texto), então não reinicia a paginação
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
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
    queryKey: ["assessments", "pending", userId, pendingPage],
    queryFn: () =>
      getPendingAssessments({ userId: userId as number, page: pendingPage, perPage: 6 }),
    enabled: Boolean(userId),
    retry: false,
    placeholderData: keepPreviousData,
  });

  // TanStack Query - Catalog Journeys
  const catalogQuery = useQuery({
    queryKey: ["assessments", "catalog", catalogPage, locale],
    queryFn: () =>
      getCatalogAssessments({
        page: catalogPage,
        limit: 6,
        locale,
      }),
    placeholderData: keepPreviousData,
    retry: false,
  });

  // `placeholderData: keepPreviousData` já resolve o "meio do caminho": ao
  // trocar de página, a query mostra os dados da página anterior enquanto
  // busca a nova (sem cair para `isLoading`). Só que isso não sobrevive a um
  // erro — se a busca da nova página falhar, `data` volta a `undefined`. Por
  // isso ainda guardamos o último resultado bem-sucedido de cada seção, só
  // para esse caso: manter os cards visíveis quando a troca de página falha.
  const [pendingLastSuccess, setPendingLastSuccess] =
    useState<PaginatedResponse<Journey> | null>(null);
  const [catalogLastSuccess, setCatalogLastSuccess] =
    useState<PaginatedResponse<Journey> | null>(null);

  useEffect(() => {
    if (pendingQuery.data) setPendingLastSuccess(pendingQuery.data);
  }, [pendingQuery.data]);

  useEffect(() => {
    if (catalogQuery.data) setCatalogLastSuccess(catalogQuery.data);
  }, [catalogQuery.data]);

  const pendingData = pendingQuery.data ?? pendingLastSuccess;
  const catalogData = catalogQuery.data ?? catalogLastSuccess;

  const pendingJourneys = pendingData?.items ?? [];
  const pendingTotal = pendingData?.total ?? 0;
  const pendingTotalPages = pendingData?.totalPages ?? 1;
  // Enquanto a sessão carrega a query fica desabilitada (isLoading = false);
  // mantém o skeleton em vez de ocultar a seção e reexibi-la em seguida.
  const isPendingLoading = pendingQuery.isLoading || (!userId && isAuthLoading);
  const pendingError =
    pendingQuery.isError && !pendingLastSuccess
      ? formatErrorMessage(pendingQuery.error, t("errorMessage"))
      : null;

  const normalizedSearch = normalizeSearch(debouncedSearchTerm);
  const catalogJourneys = (catalogData?.items ?? [])
    .map((journey) =>
      // O perfil da jornada em andamento continua a jornada atual em vez de
      // levar ao resumo do perfil (que tentaria criar outra jornada)
      currentJourney.journeyId && journey.id === currentJourney.profileId
        ? {
            ...journey,
            status: "in_progress" as const,
            href: getJourneySummaryUrl(currentJourney.journeyId),
          }
        : journey
    )
    .filter(
      (journey) =>
        !normalizedSearch ||
        normalizeSearch(`${journey.title} ${journey.description}`).includes(normalizedSearch)
    );
  const catalogTotalPages = catalogData?.totalPages ?? 1;
  const isCatalogLoading = catalogQuery.isLoading;
  const catalogError =
    catalogQuery.isError && !catalogLastSuccess
      ? formatErrorMessage(catalogQuery.error, t("errorMessage"))
      : null;

  // Toast pontual: falha ao trocar de página quando já havia dados na tela.
  const [pendingPageError, setPendingPageError] = useState<string | null>(null);
  const pendingToastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissPendingPageError = useCallback(() => {
    setPendingPageError(null);
    if (pendingToastTimerRef.current) clearTimeout(pendingToastTimerRef.current);
  }, []);

  useEffect(() => {
    if (pendingQuery.isError && pendingLastSuccess) {
      setPendingPageError(formatErrorMessage(pendingQuery.error, t("errorMessage")));
      if (pendingToastTimerRef.current) clearTimeout(pendingToastTimerRef.current);
      pendingToastTimerRef.current = setTimeout(
        () => setPendingPageError(null),
        PAGE_ERROR_TOAST_DURATION
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery.isError, pendingQuery.error]);

  const [catalogPageError, setCatalogPageError] = useState<string | null>(null);
  const catalogToastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissCatalogPageError = useCallback(() => {
    setCatalogPageError(null);
    if (catalogToastTimerRef.current) clearTimeout(catalogToastTimerRef.current);
  }, []);

  useEffect(() => {
    if (catalogQuery.isError && catalogLastSuccess) {
      setCatalogPageError(formatErrorMessage(catalogQuery.error, t("errorMessage")));
      if (catalogToastTimerRef.current) clearTimeout(catalogToastTimerRef.current);
      catalogToastTimerRef.current = setTimeout(
        () => setCatalogPageError(null),
        PAGE_ERROR_TOAST_DURATION
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogQuery.isError, catalogQuery.error]);

  useEffect(() => {
    return () => {
      if (pendingToastTimerRef.current) clearTimeout(pendingToastTimerRef.current);
      if (catalogToastTimerRef.current) clearTimeout(catalogToastTimerRef.current);
    };
  }, []);

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

  return {
    pendingJourneys,
    pendingTotal,
    pendingPage,
    pendingTotalPages,
    isPendingLoading,
    pendingError,
    isPendingSectionVisible,
    handlePendingPageChange,
    handleRetryPending,
    pendingPageError,
    dismissPendingPageError,

    catalogJourneys,
    catalogPage,
    catalogTotalPages,
    isCatalogLoading,
    catalogError,
    searchTerm,
    handleSearchChange,
    handleCatalogPageChange,
    handleRetryCatalog,
    catalogPageError,
    dismissCatalogPageError,

    labels,
  };
}
