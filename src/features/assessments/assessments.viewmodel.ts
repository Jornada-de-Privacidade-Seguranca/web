"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CURRENT_JOURNEY_QUERY_KEY, useJourneyContext } from "@hooks/useJourneyContext";
import { getCompetenciesAreaUrl, getJourneySummaryUrl } from "@shared/utils/journeyRoutes";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@hooks/useAuth";
import {
  cancelPendingJourney,
  getPendingAssessments,
  getCatalogAssessments,
} from "@services/assessmentsService";
import { ApiRequestError } from "@services/httpClient";
import type {
  AssessmentsViewModelReturn,
  AssessmentsLabels,
  JourneyDomain,
  JourneyStatus,
  JourneyFilters,
} from "./assessments.types";

const CATALOG_PAGE_SIZE = 9;

export function useAssessmentsVM(): AssessmentsViewModelReturn {
  const t = useTranslations("assessments");
  const locale = useLocale() === "en" ? "en" : "pt";
  const currentJourney = useJourneyContext();
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<JourneyFilters>({
    domains: [],
    statuses: [],
  });

  // Pagination State for Catalog
  const [catalogPage, setCatalogPage] = useState<number>(1);

  // Cancelamento da jornada pendente (POST /journeys/{journey}/cancel)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isCancellingJourney, setIsCancellingJourney] = useState<boolean>(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState<string | null>(null);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);
  const isCancellingRef = useRef<boolean>(false);

  // Debounce for search term (300ms)
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

  // TanStack Query - Pending Journey (at most 1)
  const pendingQuery = useQuery({
    queryKey: ["assessments", "pending", userId, locale],
    queryFn: () =>
      getPendingAssessments({
        userId: userId as number,
        page: 1,
        perPage: 1,
        locale,
      }),
    enabled: Boolean(userId),
    retry: false,
    placeholderData: keepPreviousData,
  });

  // Busca, filtros e paginação vão para a API. A chave da consulta muda a cada
  // combinação, então uma resposta antiga nunca substitui a mais recente.
  const catalogSearch = debouncedSearchTerm.trim();
  const catalogQuery = useQuery({
    queryKey: [
      "assessments",
      "catalog",
      locale,
      catalogPage,
      catalogSearch,
      filters.domains.join(","),
      filters.statuses.join(","),
    ],
    queryFn: () =>
      getCatalogAssessments({
        page: catalogPage,
        limit: CATALOG_PAGE_SIZE,
        locale,
        search: catalogSearch,
        domains: filters.domains,
        statuses: filters.statuses,
      }),
    placeholderData: keepPreviousData,
    retry: false,
  });

  // Derived pending journey. "Continuar jornada" retoma na primeira área com
  // competências sem resposta, como no resumo da jornada.
  const pendingItem =
    pendingQuery.data?.items && pendingQuery.data.items.length > 0
      ? pendingQuery.data.items[0]
      : null;
  const rawPendingJourney = useMemo(() => {
    if (!pendingItem) return null;
    if (currentJourney.journeyId !== pendingItem.id) return pendingItem;
    return { ...pendingItem, href: getCompetenciesAreaUrl(currentJourney.resumeAreaIndex) };
  }, [pendingItem, currentJourney.journeyId, currentJourney.resumeAreaIndex]);

  const isPendingLoading = pendingQuery.isLoading || (!userId && isAuthLoading);
  const pendingError = pendingQuery.isError ? t("errorMessage") : null;

  const hasPendingJourney = rawPendingJourney !== null;

  const catalogJourneys = useMemo(() => {
    return (catalogQuery.data?.items ?? []).map((journey) => {
      if (currentJourney.journeyId && journey.id === currentJourney.profileId) {
        return {
          ...journey,
          status: "in_progress" as const,
          href: getJourneySummaryUrl(currentJourney.journeyId),
        };
      }
      return journey;
    });
  }, [catalogQuery.data?.items, currentJourney.journeyId, currentJourney.profileId]);

  const catalogTotalItems = catalogQuery.data?.total ?? 0;
  const catalogTotalPages = Math.max(1, catalogQuery.data?.totalPages ?? 1);

  const isCatalogLoading = catalogQuery.isLoading;
  const catalogError = catalogQuery.isError ? t("errorMessage") : null;

  // Handlers for filters
  const handleToggleDomainFilter = useCallback((domain: JourneyDomain) => {
    setFilters((prev) => {
      const exists = prev.domains.includes(domain);
      const domains = exists
        ? prev.domains.filter((d) => d !== domain)
        : [...prev.domains, domain];
      return { ...prev, domains };
    });
    setCatalogPage(1);
  }, []);

  const handleToggleStatusFilter = useCallback((status: JourneyStatus) => {
    setFilters((prev) => {
      const exists = prev.statuses.includes(status);
      const statuses = exists
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses };
    });
    setCatalogPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ domains: [], statuses: [] });
    setCatalogPage(1);
  }, []);

  const handleToggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen((prev) => !prev);
  }, []);

  const activeFiltersCount = filters.domains.length + filters.statuses.length;

  // Handlers for cancel modal
  const handleOpenCancelModal = useCallback(() => {
    setCancelErrorMessage(null);
    setCancelSuccessMessage(null);
    setIsCancelModalOpen(true);
  }, []);

  const handleCloseCancelModal = useCallback(() => {
    // Durante a chamada a confirmação não fecha
    if (isCancellingRef.current) return;
    setIsCancelModalOpen(false);
    setCancelErrorMessage(null);
  }, []);

  /** Recarrega o que depende da jornada pendente: listagem, catálogo, Painel e jornada atual. */
  const refreshAfterCancellation = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["assessments"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      queryClient.invalidateQueries({ queryKey: CURRENT_JOURNEY_QUERY_KEY }),
    ]);
  }, [queryClient]);

  const handleConfirmCancelJourney = useCallback(async () => {
    const journeyId = pendingItem?.id;
    // Um segundo clique durante a chamada não dispara outro cancelamento
    if (!journeyId || isCancellingRef.current) return;

    isCancellingRef.current = true;
    setIsCancellingJourney(true);
    setCancelErrorMessage(null);
    try {
      await cancelPendingJourney(journeyId);
      setIsCancelModalOpen(false);
      setCancelSuccessMessage(t("cancelSuccess"));
      await refreshAfterCancellation();
    } catch (error) {
      const status = error instanceof ApiRequestError ? error.status : undefined;
      if (status === 409) {
        setCancelErrorMessage(t("cancelNotAllowed"));
        await queryClient.invalidateQueries({ queryKey: ["assessments", "pending"] });
      } else if (status === 403 || status === 404) {
        setCancelErrorMessage(t("cancelUnavailable"));
        await queryClient.invalidateQueries({ queryKey: ["assessments", "pending"] });
      } else {
        // Rede ou 5xx: a confirmação continua aberta para tentar de novo
        setCancelErrorMessage(t("cancelError"));
      }
    } finally {
      isCancellingRef.current = false;
      setIsCancellingJourney(false);
    }
  }, [pendingItem?.id, queryClient, refreshAfterCancellation, t]);

  const handleDismissCancelSuccess = useCallback(() => {
    setCancelSuccessMessage(null);
  }, []);

  // Handlers for pagination and retry
  const handleCatalogPageChange = useCallback((page: number) => {
    setCatalogPage(page);
  }, []);

  const handleRetryPending = useCallback(() => {
    void pendingQuery.refetch();
  }, [pendingQuery]);

  const handleRetryCatalog = useCallback(() => {
    void catalogQuery.refetch();
  }, [catalogQuery]);

  // Labels
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
    actionCancel: t("actionCancel"),
    assignedBadge: t("assignedBadge"),
    inProgressBadge: t("inProgressBadge"),
    assignedBy: (name: string) => t("assignedBy", { name }),
    onlyAssignerCanCancel: t("onlyAssignerCanCancel"),
    completedScoreBadge: (score: number) => t("completedScoreBadge", { score }),
    competenciesCount: (count: number) => t("competenciesCount", { count }),
    questionsCount: (count: number) => t("questionsCount", { count }),
    estimatedMinutes: (minutes: number) => t("estimatedMinutes", { minutes }),
    filtersButton: t("filtersButton"),
    filtersButtonWithCount: (count: number) => t("filtersButtonWithCount", { count }),
    filtersPanelTitle: t("filtersPanelTitle"),
    filtersClear: t("filtersClear"),
    filterDomainTitle: t("filterDomainTitle"),
    filterDomainPrivacy: t("filterDomainPrivacy"),
    filterDomainSecurity: t("filterDomainSecurity"),
    filterDomainJoint: t("filterDomainJoint"),
    filterStatusTitle: t("filterStatusTitle"),
    filterStatusCompleted: t("filterStatusCompleted"),
    filterStatusNotStarted: t("filterStatusNotStarted"),
    filterStatusInProgress: t("filterStatusInProgress"),
    cancelModalTitle: t("cancelModalTitle"),
    cancelModalDescription: t("cancelModalDescription"),
    cancelModalKeep: t("cancelModalKeep"),
    cancelModalConfirm: t("cancelModalConfirm"),
    cancelModalConfirming: t("cancelModalConfirming"),
    cancelSuccess: t("cancelSuccess"),
    cancelError: t("cancelError"),
    cancelNotAllowed: t("cancelNotAllowed"),
    cancelUnavailable: t("cancelUnavailable"),
    closeMessage: t("closeMessage"),
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
    pendingJourney: rawPendingJourney,
    hasPendingJourney,
    isPendingLoading,
    pendingError,
    handleRetryPending,

    isCancelModalOpen,
    isCancellingJourney,
    cancelErrorMessage,
    cancelSuccessMessage,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancelJourney,
    handleDismissCancelSuccess,

    catalogJourneys,
    catalogPage,
    catalogTotalPages,
    catalogTotalItems,
    isCatalogLoading,
    catalogError,
    searchTerm,
    handleSearchChange,
    handleCatalogPageChange,
    handleRetryCatalog,
    catalogPageError: null,
    dismissCatalogPageError: () => {},

    isFilterPanelOpen,
    handleToggleFilterPanel,
    activeFiltersCount,
    filters,
    handleToggleDomainFilter,
    handleToggleStatusFilter,
    handleClearFilters,

    labels,
  };
}
