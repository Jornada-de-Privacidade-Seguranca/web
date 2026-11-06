"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen01Icon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  Timer02Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "@shared/i18n/navigation";
import { useAuth } from "@hooks/useAuth";
import { CURRENT_JOURNEY_QUERY_KEY, useJourneyContext } from "@hooks/useJourneyContext";
import { ApiRequestError } from "@services/httpClient";
import { createJourney } from "@services/journeyService";
import {
  getJourneySummary,
  getLastProfileScore,
  getProfileSummary,
  JourneySummaryRequestError,
} from "@services/journeySummaryService";
import { getCompetenciesAreaUrl } from "@shared/utils/journeyRoutes";
import { requiresJourneyCreation } from "./journeySummary.utils";
import type {
  JourneySummaryViewModelReturn,
  JourneySummaryErrorType,
  JourneySummaryLabels,
  JourneySummaryTarget,
  JourneyInstructionItem,
} from "./journeySummary.types";

// As instruções ficam no próprio resumo: a jornada começa pela primeira área do
// questionário de competências
const START_URL = getCompetenciesAreaUrl(0);
const JOURNEYS_URL = "/jornadas";

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

  // Nota da última jornada concluída desse perfil, exibida ao lado do título
  const profileId = journey?.profileId ?? null;
  const lastScoreQuery = useQuery({
    queryKey: ["journey-summary", "last-score", userId, profileId],
    queryFn: () => getLastProfileScore(userId as number, profileId as string),
    enabled: Boolean(userId && profileId),
  });
  const lastScore = lastScoreQuery.data ?? null;

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

  // Retomar leva à primeira área com competências ainda sem resposta
  const resumeUrl = getCompetenciesAreaUrl(currentJourney.resumeAreaIndex);

  const onStartJourney = () => {
    if (!journey || isCtaDisabled) return;
    // A jornada em andamento apenas continua, sem criar outra
    if (!isCurrentJourney && requiresJourneyCreation(journey)) {
      startMutation.mutate();
      return;
    }
    router.push(isCurrentJourney ? resumeUrl : START_URL);
  };

  // Retoma a jornada que já está em andamento (aviso exibido após o 409)
  const onResumeCurrentJourney = () => {
    router.push(resumeUrl);
  };

  const onDismiss = () => {
    router.push(JOURNEYS_URL);
  };

  // Aviso exibido ao abrir a página ou, se a verificação não pegar o caso,
  // quando o backend recusar a criação com 409
  const journeyInProgressNotice =
    hasOtherJourneyInProgress || hasConflictOnStart ? t("journeyInProgressMessage") : null;

  const startError =
    startMutation.isError && !hasConflictOnStart ? t("startErrorMessage")
      : null;

  // Sem domínio informado, usa o texto da jornada conjunta
  const domainText = t(`instructions.domains.${journey?.domain ?? "joint"}`);
  const estimatedMinutes = journey?.estimatedMinutes ?? null;

  const instructionItems: JourneyInstructionItem[] = [
    {
      id: "objective",
      icon: CheckListIcon,
      title: t("instructions.items.objective.title"),
      description: t("instructions.items.objective.description"),
    },
    {
      id: "sincerity",
      icon: BookOpen01Icon,
      title: t("instructions.items.sincerity.title"),
      description: t("instructions.items.sincerity.description"),
    },
    {
      id: "navigation",
      icon: CheckmarkCircle02Icon,
      title: t("instructions.items.navigation.title"),
      description: t("instructions.items.navigation.description"),
    },
    {
      id: "estimatedTime",
      icon: Timer02Icon,
      title: t("instructions.items.estimatedTime.title"),
      // Sem a duração (resumo de perfil, antes de a jornada existir), o card
      // mostra o texto sem o tempo
      description:
        estimatedMinutes !== null
          ? t("instructions.items.estimatedTime.description", { minutes: estimatedMinutes })
          : t("instructions.items.estimatedTime.fallbackDescription"),
    },
  ];

  const labels: JourneySummaryLabels = {
    loadingTitle: t("loadingTitle"),
    subtitleStatic: t("subtitleStatic"),
    backToJourneysText: t("backToJourneys"),
    backToJourneysAriaLabel: t("backToJourneysAriaLabel"),
    badgeLabel: t("badgeLabel"),
    domainLabel: journey?.domain ? t(`domainLabels.${journey.domain}`) : null,
    lastScoreText: (score: number) => t("lastScoreText", { score }),
    lastScoreAriaLabel: (score: number) => t("lastScoreAriaLabel", { score }),
    durationLabel: t("durationLabel"),
    areasLabel: t("areasLabel"),
    competenciesLabel: t("competenciesLabel"),
    durationAriaLabel: (minutes: number) => t("durationAriaLabel", { minutes }),
    areasAriaLabel: (count: number) => t("areasAriaLabel", { count }),
    competenciesAriaLabel: (count: number) => t("competenciesAriaLabel", { count }),
    estimatedMinutesText: (minutes: number) => t("estimatedMinutesText", { minutes }),
    howItWorksTitle: t("howItWorksTitle"),
    instructionsIntro: t("instructions.intro", { domain: domainText }),
    instructionsAriaLabel: t("instructions.instructionsAriaLabel"),
    instructionsTip: t("instructions.tip"),
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
    lastScore,
    instructionItems,
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
