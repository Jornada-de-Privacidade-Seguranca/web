"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@hooks/useAuth";
import { usePermission } from "@hooks/usePermission";
import { getDashboardData } from "@services/dashboardService";
import { HISTORY_LIMIT } from "@shared/constants/dashboard";
import {
  getCompetenciesAreaUrl,
  getJourneySummaryUrl,
} from "@shared/utils/journeyRoutes";
import type { MetricsGridItem } from "@/components/ui/MetricsGrid/metricsGrid.types";
import type {
  PainelViewModelReturn,
  QuickActionItem,
  DashboardMetrics,
  PainelLabels,
} from "./painel.types";

const DEFAULT_METRICS: DashboardMetrics = {
  completedJourneys: 0,
  pendingJourneys: 0,
  averageScore: 0,
};

export function usePainelVM(): PainelViewModelReturn {
  const t = useTranslations("painel");
  const tAccess = useTranslations("accessDenied");
  const { user, isLoading: isAuthLoading } = useAuth();
  const { can } = usePermission();
  const searchParams = useSearchParams();

  const [hasDismissedAccessDenied, setHasDismissedAccessDenied] = useState(false);
  const isAccessDeniedFromUrl = searchParams?.get("error") === "access_denied";
  const showAccessDenied = isAccessDeniedFromUrl && !hasDismissedAccessDenied;

  const handleDismissAccessDenied = () => {
    setHasDismissedAccessDenied(true);
  };

  const userFirstName = user?.name ? user.name.split(" ")[0] : t("defaultUserName");
  const userRoleName =
    user?.profile?.profile_type_name ||
    user?.profile?.label ||
    t("profileRoleFallback");

  const userOrganization = user?.organization ?? null;

  const userId = user?.id;

  const {
    data,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => getDashboardData(HISTORY_LIMIT),
    enabled: Boolean(userId),
    retry: false,
  });

  const isLoading = (isQueryLoading || (isAuthLoading && !userId)) && !data;
  const errorMessage = queryError ? t("errorMessage") : null;

  const currentJourney = data?.pending ?? null;
  const lastCompletedAssessment = data?.lastCompleted ?? null;
  const history = data?.history ?? [];
  const metrics = data?.metrics ?? DEFAULT_METRICS;

  const quickActions: QuickActionItem[] = [];

  if (can("journeys.take")) {
    let journeyActionHref = "/jornadas";
    let journeyActionLabel = t("quickActionStartJourney");
    let journeyActionDesc = t("quickActionStartJourneyDesc");

    if (currentJourney) {
      if (currentJourney.status === "pending") {
        journeyActionHref = getJourneySummaryUrl(currentJourney.id || "atual");
        journeyActionLabel = t("quickActionStartJourney");
        journeyActionDesc = t("quickActionStartJourneyDesc");
      } else {
        journeyActionHref = getCompetenciesAreaUrl(0);
        journeyActionLabel = t("quickActionContinueJourney");
        journeyActionDesc = t("quickActionContinueJourneyDesc");
      }
    }

    quickActions.push({
      id: currentJourney?.status === "in_progress" ? "continue-journey" : "start-journey",
      label: journeyActionLabel,
      description: journeyActionDesc,
      href: journeyActionHref,
      iconName: "play",
    });
  }

  if (can("results.view_own")) {
    quickActions.push({
      id: "view-results",
      label: t("quickActionViewResults"),
      description: t("quickActionViewResultsDesc"),
      href: "/resultados",
      iconName: "award",
    });
  }

  quickActions.push({
    id: "view-profile",
    label: t("quickActionViewProfile"),
    description: t("quickActionViewProfileDesc"),
    href: "/perfil",
    iconName: "user",
  });

  const labels: PainelLabels = {
    pageTitle: t("pageTitle"),
    welcomeGreeting: t("welcomeGreeting", { name: userFirstName }),
    welcomeSubtitle: t("welcomeSubtitle"),
    profileRoleFallback: t("profileRoleFallback"),
    organizationLabel: userOrganization
      ? t("organizationLabel", { organization: userOrganization })
      : "",
    greetingSubtitle: t("greetingSubtitle"),
    quickActionsTitle: t("quickActionsTitle"),
    quickActionsSectionAriaLabel: t("quickActionsSectionAriaLabel"),
    quickActionContinueJourney: t("quickActionContinueJourney"),
    quickActionContinueJourneyDesc: t("quickActionContinueJourneyDesc"),
    quickActionStartJourney: t("quickActionStartJourney"),
    quickActionStartJourneyDesc: t("quickActionStartJourneyDesc"),
    quickActionViewResults: t("quickActionViewResults"),
    quickActionViewResultsDesc: t("quickActionViewResultsDesc"),
    quickActionViewProfile: t("quickActionViewProfile"),
    quickActionViewProfileDesc: t("quickActionViewProfileDesc"),
    currentJourneySectionTitle: t("currentJourneySectionTitle"),
    currentJourneySectionAriaLabel: t("currentJourneySectionAriaLabel"),
    currentJourneyEmpty: t("currentJourneyEmpty"),
    startFirstJourneyCta: t("startFirstJourneyCta"),
    startNewJourneyCta: t("startNewJourneyCta"),
    continueJourneyCta: t("continueJourneyCta"),
    progressLabel: t("progressLabel"),
    progressPercentLabel: t("progressPercentLabel", { percent: "{percent}" }),
    metricsSectionTitle: t("metricsSectionTitle"),
    metricsSectionAriaLabel: t("metricsSectionAriaLabel"),
    metricsCompletedTitle: t("metricsCompletedTitle"),
    metricsCompletedSubtitle: t("metricsCompletedSubtitle"),
    metricsPendingTitle: t("metricsPendingTitle"),
    metricsPendingSubtitle: t("metricsPendingSubtitle"),
    metricsAverageScoreTitle: t("metricsAverageScoreTitle"),
    metricsAverageScoreSubtitle: t("metricsAverageScoreSubtitle"),
    pendingSectionTitle: t("pendingSectionTitle"),
    completedSectionTitle: t("completedSectionTitle"),
    historySectionTitle: t("historySectionTitle"),
    pendingEmpty: t("pendingEmpty"),
    completedEmpty: t("completedEmpty"),
    historyEmpty: t("historyEmpty"),
    badgePending: t("badgePending"),
    badgeInProgress: t("badgeInProgress"),
    startAssessment: t("startAssessment"),
    continueAssessment: t("continueAssessment"),
    lastCompletionLabel: t("lastCompletionLabel"),
    scoreLabel: t("scoreLabel"),
    viewResult: t("viewResult"),
    viewAllResults: t("viewAllResults"),
    defaultUserName: t("defaultUserName"),
    errorTitle: t("errorTitle"),
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
    loadingAriaLabel: t("loadingAriaLabel"),
    pendingSectionAriaLabel: t("pendingSectionAriaLabel"),
    completedSectionAriaLabel: t("completedSectionAriaLabel"),
    historySectionAriaLabel: t("historySectionAriaLabel"),
    accessDeniedTitle: tAccess("title"),
    accessDeniedMessage: tAccess("description"),
  };

  const metricsItems: MetricsGridItem[] = [
    {
      id: "completed-journeys",
      label: labels.metricsCompletedTitle,
      value: metrics.completedJourneys,
      subtitle: labels.metricsCompletedSubtitle,
    },
    {
      id: "pending-journeys",
      label: labels.metricsPendingTitle,
      value: metrics.pendingJourneys,
      subtitle: labels.metricsPendingSubtitle,
    },
    {
      id: "average-score",
      label: labels.metricsAverageScoreTitle,
      value: metrics.averageScore,
      suffix: "/ 100",
      subtitle: labels.metricsAverageScoreSubtitle,
    },
  ];

  const handleRetry = () => {
    void refetch();
  };

  return {
    userFirstName,
    userRoleName,
    userOrganization,
    greetingTitle: labels.welcomeGreeting,
    greetingSubtitle: labels.welcomeSubtitle,
    currentJourney,
    lastCompletedAssessment,
    history,
    metrics,
    metricsItems,
    quickActions,
    isLoading,
    error: errorMessage,
    accessDeniedMessage: showAccessDenied ? labels.accessDeniedMessage : null,
    handleDismissAccessDenied,
    handleRetry,
    labels,
  };
}
