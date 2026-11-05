"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@shared/i18n/navigation";
import { useAuth } from "@hooks/useAuth";
import { CURRENT_JOURNEY_QUERY_KEY, useJourneyContext } from "@hooks/useJourneyContext";
import { ApiRequestError } from "@services/httpClient";
import { createJourney } from "@services/journeyService";
import {
  getJourneySummary,
  getProfileSummary,
  JourneySummaryRequestError,
} from "@services/journeySummaryService";
import { getCompetenciesIntroUrl } from "@shared/utils/journeyRoutes";
import { requiresJourneyCreation } from "./journeySummary.utils";
import type {
  JourneySummaryViewModelReturn,
  JourneySummaryErrorType,
  JourneySummaryLabels,
  JourneySummaryTarget,
  HowItWorksStep,
} from "./journeySummary.types";

// A jornada começa (e é retomada) pelas instruções do questionário de competências
const START_URL = getCompetenciesIntroUrl();

function isJourneyInProgressError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 409;
}

export function useJourneySummaryVM(
  target: JourneySummaryTarget
): JourneySummaryViewModelReturn {
  const t = useTranslations("journeySummary");
  const locale = useLocale() === "en" ? "en" : "pt";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const isProfileSummary = "profileId" in target;
  const targetId = isProfileSummary ? target.profileId : target.journeyId;

  // Jornada em andamento do usuário (no máximo uma), verificada ao abrir a página
  const currentJourney = useJourneyContext();

  const query = useQuery({
    queryKey: [
      "journey-summary",
      isProfileSummary ? "profile" : "detail",
      targetId,
      locale,
    ],
    queryFn: () =>
      isProfileSummary
        ? getProfileSummary(targetId, locale)
        : getJourneySummary(targetId, locale),
    enabled: Boolean(targetId),
    retry: false,
  });

  const journey = query.data ?? null;
  const isLoading = query.isLoading;

  const error: JourneySummaryErrorType | null = query.isError
    ? query.error instanceof JourneySummaryRequestError
      ? query.error.type
      : "server_error"
    : null;

  // Cria a jornada no backend (iniciar a partir do perfil ou refazer uma concluída)
  const startMutation = useMutation({
    mutationFn: () => {
      if (!userId || !journey?.profileId) {
        throw new Error("Usuário ou perfil da jornada indisponível.");
      }
      return createJourney(userId, Number(journey.profileId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_JOURNEY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      router.push(START_URL);
    },
  });

  // O resumo é da própria jornada em andamento (ou do perfil dela): o botão
  // apenas a retoma, sem criar outra
  const isCurrentJourney = isProfileSummary
    ? journey?.profileId != null && journey.profileId === currentJourney.profileId
    : journey?.id != null && journey.id === currentJourney.journeyId;

  // Outra jornada (ou um perfil) com uma jornada já em andamento: iniciar ou
  // refazer criaria uma segunda jornada, o que o backend recusa (409)
  const hasOtherJourneyInProgress = Boolean(currentJourney.journeyId) && !isCurrentJourney;
  const hasConflictOnStart = isJourneyInProgressError(startMutation.error);

  const isStarting = startMutation.isPending;
  const isCtaDisabled =
    currentJourney.isLoading || hasOtherJourneyInProgress || hasConflictOnStart || isStarting;

  const ctaLabel = journey
    ? isCurrentJourney
      ? t("actionResume")
      : journey.status === "completed"
        ? t("actionRetake")
        : t("actionStart")
    : "";

  const ctaAriaLabel = journey ? `${ctaLabel} — ${journey.title}` : "";

  const onStartJourney = () => {
    if (!journey || isCtaDisabled) return;
    // A jornada em andamento apenas continua, sem criar outra
    if (!isCurrentJourney && requiresJourneyCreation(journey)) {
      startMutation.mutate();
      return;
    }
    router.push(START_URL);
  };

  // Retoma a jornada que já está em andamento (aviso exibido após o 409)
  const onResumeCurrentJourney = () => {
    router.push(START_URL);
  };

  const onDismiss = () => {
    router.back();
  };

  // Aviso exibido ao abrir a página ou, se a verificação não pegar o caso,
  // quando o backend recusar a criação com 409
  const journeyInProgressNotice =
    hasOtherJourneyInProgress || hasConflictOnStart ? t("journeyInProgressMessage") : null;

  const startError =
    startMutation.isError && !hasConflictOnStart ? t("startErrorMessage")
      : null;

  const rawSteps = t.raw("steps");
  const steps = (Array.isArray(rawSteps) ? rawSteps : []) as HowItWorksStep[];

  const labels: JourneySummaryLabels = {
    loadingTitle: t("loadingTitle"),
    subtitleStatic: t("subtitleStatic"),
    backToJourneysText: t("backToJourneys"),
    backToJourneysAriaLabel: t("backToJourneysAriaLabel"),
    badgeLabel: t("badgeLabel"),
    stepsCountLabel: t("stepsCountLabel"),
    durationLabel: t("durationLabel"),
    areasLabel: t("areasLabel"),
    competenciesLabel: t("competenciesLabel"),
    stepsCountAriaLabel: (count: number) => t("stepsCountAriaLabel", { count }),
    stepsProgressText: (completed: number, total: number) =>
      t("stepsProgressText", { completed, total }),
    stepsProgressAriaLabel: (completed: number, total: number) =>
      t("stepsProgressAriaLabel", { completed, total }),
    durationAriaLabel: (minutes: number) => t("durationAriaLabel", { minutes }),
    areasAriaLabel: (count: number) => t("areasAriaLabel", { count }),
    competenciesAriaLabel: (count: number) => t("competenciesAriaLabel", { count }),
    estimatedMinutesText: (minutes: number) => t("estimatedMinutesText", { minutes }),
    howItWorksTitle: t("howItWorksTitle"),
    howItWorksSubtitle: t("howItWorksSubtitle"),
    steps,
    footerNote: t("footerNote"),
    dismissLabel: t("dismissLabel"),
    dismissAriaLabel: t("dismissAriaLabel"),
    notFoundTitle: t("notFoundTitle"),
    notFoundMessage: t("notFoundMessage"),
    serverErrorTitle: t("serverErrorTitle"),
    serverErrorMessage: t("serverErrorMessage"),
    backToJourneysLink: t("backToJourneysLink"),
    loadingAriaLabel: t("loadingAriaLabel"),
    notAvailable: t("notAvailable"),
    notAvailableAriaLabel: (label: string) => t("notAvailableAriaLabel", { label }),
    startingLabel: t("startingLabel"),
    startErrorMessage: t("startErrorMessage"),
    resumeCurrentJourneyLabel: t("resumeCurrentJourneyLabel"),
  };

  return {
    journey,
    isLoading,
    error,
    ctaLabel,
    ctaAriaLabel,
    isStarting,
    isCtaDisabled,
    startError,
    journeyInProgressNotice,
    onStartJourney,
    onResumeCurrentJourney,
    onDismiss,
    labels,
  };
}
