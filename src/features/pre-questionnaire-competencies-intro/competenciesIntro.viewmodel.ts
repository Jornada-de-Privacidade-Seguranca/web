"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen01Icon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  Timer02Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "@shared/i18n/navigation";
import { useJourneyContext } from "@hooks/useJourneyContext";
import { getJourneySummary } from "@services/journeySummaryService";
import {
  getCompetenciesAreaUrl,
  getCurrentJourneyStepUrl,
  getPreviousPreQuestionnaireStep,
} from "@shared/utils/journeyRoutes";
import type {
  CompetenciesIntroLabels,
  CompetenciesIntroViewModelReturn,
  InstructionItem,
} from "./competenciesIntro.types";

const PREVIOUS_STEP = getPreviousPreQuestionnaireStep("competencias");

const JOURNEYS_HREF = "/jornadas";

export function useCompetenciesIntroVM(): CompetenciesIntroViewModelReturn {
  const t = useTranslations("preQuestionnaire");
  const locale = useLocale() === "en" ? "en" : "pt";
  const router = useRouter();
  const {
    journeyId,
    profileName,
    domain,
    isLoading: isJourneyContextLoading,
    isNotFound,
  } = useJourneyContext();

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Mesma consulta (e cache) da tela de resumo da jornada, de onde vem a duração estimada
  const summaryQuery = useQuery({
    queryKey: ["journey-summary", "detail", journeyId, locale],
    queryFn: () => getJourneySummary(journeyId as string, locale),
    enabled: Boolean(journeyId),
    retry: false,
  });

  const isLoading = isJourneyContextLoading || summaryQuery.isLoading;
  const estimatedMinutes = summaryQuery.data?.estimatedMinutes ?? null;

  // Sem domínio (falha ao carregar o contexto), usa o texto da jornada conjunta
  const domainText = t(`competenciesIntro.domains.${domain ?? "joint"}`);

  const instructionItems: InstructionItem[] = [
    {
      id: "objective",
      icon: CheckListIcon,
      title: t("competenciesIntro.items.objective.title"),
      description: t("competenciesIntro.items.objective.description"),
      isLoading: false,
    },
    {
      id: "sincerity",
      icon: BookOpen01Icon,
      title: t("competenciesIntro.items.sincerity.title"),
      description: t("competenciesIntro.items.sincerity.description"),
      isLoading: false,
    },
    {
      id: "navigation",
      icon: CheckmarkCircle02Icon,
      title: t("competenciesIntro.items.navigation.title"),
      description: t("competenciesIntro.items.navigation.description"),
      isLoading: false,
    },
    {
      id: "estimatedTime",
      icon: Timer02Icon,
      title: t("competenciesIntro.items.estimatedTime.title"),
      // Sem a duração (falha ao carregar), o card mostra o texto sem o tempo
      description:
        estimatedMinutes !== null
          ? t("competenciesIntro.items.estimatedTime.description", {
              minutes: estimatedMinutes,
            })
          : t("competenciesIntro.items.estimatedTime.fallbackDescription"),
      isLoading,
    },
  ];

  const handleStart = () => {
    router.push(getCompetenciesAreaUrl(0));
  };

  const handleBack = () => {
    // Retorna para a etapa anterior: Certificações Profissionais
    if (PREVIOUS_STEP) {
      router.push(getCurrentJourneyStepUrl(PREVIOUS_STEP));
    }
  };

  const handleExit = () => {
    setIsExitModalOpen(true);
  };

  const handleCancelExit = () => {
    setIsExitModalOpen(false);
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    router.push(JOURNEYS_HREF);
  };

  const labels: CompetenciesIntroLabels = {
    stepTag: t("competenciesIntro.stepTag"),
    title: t("competenciesIntro.title"),
    subtitle: t("competenciesIntro.subtitle"),
    intro: t("competenciesIntro.intro", { domain: domainText }),
    tip: t("competenciesIntro.tip"),
    instructionsAriaLabel: t("competenciesIntro.instructionsAriaLabel"),
    startLabel: t("competenciesIntro.startButton"),
    backLabel: t("actions.back"),
    backAriaLabel: t("header.backAriaLabel"),
    exitLabel: t("header.exitButton"),
    exitAriaLabel: t("header.exitAriaLabel"),
    exitModal: {
      title: t("exitModal.title"),
      description: t("exitModal.description"),
      cancelButton: t("exitModal.cancelButton"),
      confirmButton: t("exitModal.confirmButton"),
    },
    loadingText: t("competenciesIntro.loading"),
    noOngoingJourneyTitle: t("noOngoingJourneyTitle"),
    noOngoingJourneyMessage: t("noOngoingJourneyMessage"),
    backToJourneysLink: t("backToJourneysLink"),
  };

  return {
    journeyTitle: profileName ?? "",
    labels,
    instructionItems,
    isLoading,
    isJourneyNotFound: isNotFound,
    isExitModalOpen,
    journeysHref: JOURNEYS_HREF,
    handleStart,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
  };
}
