"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@hooks/useAuth";
import { getDashboardData } from "@services/dashboardService";
import { HISTORY_LIMIT } from "@shared/constants/dashboard";
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
  const { user, isLoading: isAuthLoading } = useAuth();

  const userFirstName = user?.name ? user.name.split(" ")[0] : "Usuário";
  const userRoleName =
    user?.profile?.profile_type_name ||
    user?.profile?.label ||
    t("profileRoleFallback");

  const userOrganization =
    (user as { organization?: string })?.organization || null;

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

  const errorMessage = queryError
    ? queryError instanceof Error
      ? queryError.message
      : t("errorMessage")
    : null;

  const currentJourney = data?.pending ?? null;
  const lastCompletedAssessment = data?.lastCompleted ?? null;
  const history = data?.history ?? [];
  const metrics = data?.metrics ?? DEFAULT_METRICS;

  const quickActions: QuickActionItem[] = [
    currentJourney
      ? {
          id: "continue-journey",
          label: t("quickActionContinueJourney"),
          description: t("quickActionContinueJourneyDesc"),
          href: currentJourney.currentStep
            ? `/jornada/atual/${currentJourney.currentStep}`
            : "/jornada/atual/experiencia-profissional",
          iconName: "play",
        }
      : {
          id: "start-journey",
          label: t("quickActionStartJourney"),
          description: t("quickActionStartJourneyDesc"),
          href: "/jornadas",
          iconName: "play",
        },
    {
      id: "view-results",
      label: t("quickActionViewResults"),
      description: t("quickActionViewResultsDesc"),
      href: "/resultados",
      iconName: "award",
    },
    {
      id: "view-profile",
      label: t("quickActionViewProfile"),
      description: t("quickActionViewProfileDesc"),
      href: "/perfil",
      iconName: "user",
    },
  ];

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
    startNewJourneyCta: t("startNewJourneyCta"),
    continueJourneyCta: t("continueJourneyCta"),
    progressLabel: t("progressLabel"),
    progressPercentLabel: t("progressPercentLabel"),
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
    errorTitle: t("errorTitle"),
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
    loadingAriaLabel: t("loadingAriaLabel"),
    pendingSectionAriaLabel: t("pendingSectionAriaLabel"),
    completedSectionAriaLabel: t("completedSectionAriaLabel"),
    historySectionAriaLabel: t("historySectionAriaLabel"),
  };

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
    quickActions,
    isLoading,
    error: errorMessage,
    handleRetry,
    labels,
  };
}
