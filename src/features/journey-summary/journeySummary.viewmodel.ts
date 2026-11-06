"use client";

import { useState } from "react";
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
import { selectInitialJourneyProfile } from "@services/journeyProfileService";
import {
  getJourneySummary,
  getLastProfileScore,
  getProfileSummary,
  hasAnyJourney,
  JourneySummaryRequestError,
} from "@services/journeySummaryService";
import { getCompetenciesAreaUrl, getProfileSummaryUrl } from "@shared/utils/journeyRoutes";
import { getProfileSelectionErrorType, requiresJourneyCreation } from "./journeySummary.utils";
import type {
  InitialProfileNotice,
  JourneySummaryViewModelReturn,
  JourneySummaryErrorType,
  JourneySummaryLabels,
  JourneySummaryTarget,
  JourneyInstructionItem,
  ProfileSelectionErrorType,
} from "./journeySummary.types";

// As instruções ficam no próprio resumo: a jornada começa pela primeira área do
// questionário de competências
const START_URL = getCompetenciesAreaUrl(0);
const JOURNEYS_URL = "/jornadas";
const JOURNEY_HISTORY_QUERY_KEY = ["journey-summary", "has-journeys"];

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
  const { user, setAuth } = useAuth();
  const userId = user?.id;
  // Perfil de jornada inicial salvo no /me; null até o usuário escolher
  const initialProfileId = user?.profile?.journey_profile_id ?? null;

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

  // Sem nenhuma jornada, a primeira exige o perfil de jornada inicial salvo
  const journeyHistoryQuery = useQuery({
    queryKey: [...JOURNEY_HISTORY_QUERY_KEY, userId],
    queryFn: () => hasAnyJourney(userId as number),
    enabled: Boolean(userId),
    retry: false,
  });

  const [isProfileSelectionOpen, setIsProfileSelectionOpen] = useState(false);

  const onJourneyCreated = () => {
    void queryClient.invalidateQueries({ queryKey: CURRENT_JOURNEY_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["assessments"] });
    void queryClient.invalidateQueries({ queryKey: JOURNEY_HISTORY_QUERY_KEY });
    router.push(START_URL);
  };

  // Cria a jornada no backend (iniciar a partir do perfil ou refazer uma concluída)
  const startMutation = useMutation({
    mutationFn: () => {
      if (!userId || !journey?.profileId) {
        throw new Error("Usuário ou perfil da jornada indisponível.");
      }
      return createJourney(userId, Number(journey.profileId));
    },
    onSuccess: onJourneyCreated,
    onError: (error) => {
      // A verificação do histórico pode falhar; o backend ainda exige o perfil inicial
      if (getProfileSelectionErrorType(error) === "selectionRequired") {
        setIsProfileSelectionOpen(true);
      }
    },
  });

  // Salva o perfil de jornada inicial e cria a primeira jornada com ele
  const profileSelectionMutation = useMutation({
    mutationFn: async () => {
      if (!user || !userId || !journey?.profileId) {
        throw new Error("Usuário ou perfil da jornada indisponível.");
      }
      const profileId = Number(journey.profileId);
      const selected = await selectInitialJourneyProfile(profileId);
      // Atualiza o /me em memória: se a criação falhar, o perfil já está salvo
      setAuth({
        ...user,
        profile: {
          ...user.profile,
          journey_profile_id: selected.journey_profile_id,
          journey_profile_name: selected.journey_profile?.name_pt ?? null,
          journey_profile_name_en: selected.journey_profile?.name_en ?? null,
        },
      });
      return createJourney(userId, profileId);
    },
    onSuccess: () => {
      setIsProfileSelectionOpen(false);
      onJourneyCreated();
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

  // Primeira jornada do usuário. Se a verificação do histórico falhar, segue como
  // antes e o backend decide (o 422 de seleção obrigatória abre o diálogo)
  const isFirstJourney =
    journeyHistoryQuery.data === false &&
    journey !== null &&
    !isCurrentJourney &&
    requiresJourneyCreation(journey);
  const needsProfileSelection = isFirstJourney && initialProfileId === null;
  // Já escolheu o perfil inicial e abriu outro: o backend recusaria (JOURNEY_PROFILE_MISMATCH)
  const isOtherThanInitialProfile =
    isFirstJourney &&
    initialProfileId !== null &&
    journey?.profileId !== String(initialProfileId);

  const isStarting = startMutation.isPending;
  const isCtaDisabled =
    currentJourney.isLoading ||
    journeyHistoryQuery.isLoading ||
    hasOtherJourneyInProgress ||
    hasConflictOnStart ||
    isOtherThanInitialProfile ||
    isStarting;

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
    if (needsProfileSelection) {
      profileSelectionMutation.reset();
      setIsProfileSelectionOpen(true);
      return;
    }
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

  const profileSelectionErrorMessage = (type: ProfileSelectionErrorType | null) =>
    t(`profileSelection.errors.${type ?? "generic"}`);

  const startErrorType = getProfileSelectionErrorType(startMutation.error);
  // A seleção obrigatória abre o diálogo, que mostra a própria mensagem
  const startError =
    startMutation.isError && !hasConflictOnStart && startErrorType !== "selectionRequired"
      ? startErrorType
        ? profileSelectionErrorMessage(startErrorType)
        : t("startErrorMessage")
      : null;

  const selectionErrorType = getProfileSelectionErrorType(profileSelectionMutation.error);
  const selectionError = profileSelectionMutation.isError
    ? profileSelectionErrorMessage(selectionErrorType)
    : // Aberto pelo 422 de seleção obrigatória ao iniciar direto
      startErrorType === "selectionRequired"
      ? profileSelectionErrorMessage("selectionRequired")
      : null;

  const initialProfileName =
    (locale === "en"
      ? user?.profile?.journey_profile_name_en
      : user?.profile?.journey_profile_name) ||
    user?.profile?.journey_profile_name ||
    t("profileSelection.selectedProfileFallback");

  const initialProfileNotice: InitialProfileNotice | null =
    isOtherThanInitialProfile && initialProfileId !== null
      ? {
          message: t("profileSelection.mismatchNotice", { profile: initialProfileName }),
          linkLabel: t("profileSelection.goToSelectedProfile"),
          href: getProfileSummaryUrl(String(initialProfileId)),
        }
      : null;

  const onConfirmProfileSelection = () => {
    if (profileSelectionMutation.isPending) return;
    profileSelectionMutation.mutate();
  };

  const onCancelProfileSelection = () => {
    setIsProfileSelectionOpen(false);
    profileSelectionMutation.reset();
    startMutation.reset();
  };

  // Depois de uma falha geral, o botão de confirmar vira "Tentar novamente"
  const isGenericSelectionError = profileSelectionMutation.isError && selectionErrorType === null;

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
    profileSelectionTitle: t("profileSelection.title"),
    profileSelectionLockedWarning: t("profileSelection.lockedWarning"),
    profileSelectionCancel: t("profileSelection.cancel"),
    profileSelectionConfirming: t("profileSelection.confirming"),
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
    profileSelection: {
      isOpen: isProfileSelectionOpen,
      isConfirming: profileSelectionMutation.isPending,
      description: t("profileSelection.description", { profile: journey?.title ?? "" }),
      error: selectionError,
      confirmLabel: isGenericSelectionError
        ? t("profileSelection.retry")
        : t("profileSelection.confirm"),
      onConfirm: onConfirmProfileSelection,
      onCancel: onCancelProfileSelection,
    },
    initialProfileNotice,
    onStartJourney,
    onResumeCurrentJourney,
    onDismiss,
    labels,
  };
}
