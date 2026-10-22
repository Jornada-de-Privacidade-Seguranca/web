"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "@shared/i18n/navigation";
import { useJourneyContext } from "@hooks/useJourneyContext";
import {
  getPreQuestionnaireStep,
  savePreQuestionnaireStep,
} from "@services/preQuestionnaireService";
import {
  getCurrentJourneyStepUrl,
  getJourneySummaryUrl,
  getNextPreQuestionnaireStep,
} from "@shared/utils/journeyRoutes";
import {
  EXPERIENCE_STEP_ID,
  type ExperienceOptionId,
  type ExperienceOption,
  type ExperienceStepLabels,
  type ExperienceStepViewModelReturn,
} from "./experienceStep.types";

const OPTION_IDS: ExperienceOptionId[] = [
  "none",
  "less-than-1-year",
  "1-3-years",
  "4-6-years",
  "7-10-years",
  "10-plus-years",
];

const NEXT_STEP = getNextPreQuestionnaireStep("experiencia-profissional");

const JOURNEYS_HREF = "/jornadas";

export function useExperienceStepVM(): ExperienceStepViewModelReturn {
  const t = useTranslations("preQuestionnaire");
  const router = useRouter();
  const journeyContext = useJourneyContext();
  const { journeyId } = journeyContext;

  const [selectedOption, setSelectedOption] =
    useState<ExperienceOptionId | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Busca dados previamente salvos da etapa experience
  const query = useQuery({
    queryKey: ["pre-questionnaire", journeyId, EXPERIENCE_STEP_ID],
    queryFn: () => getPreQuestionnaireStep(journeyId as string, EXPERIENCE_STEP_ID),
    enabled: Boolean(journeyId),
    retry: 1,
  });

  // Pré-seleciona a resposta salva na jornada em andamento; respostas de
  // tentativas anteriores ficam em outras jornadas e não são reaproveitadas
  useEffect(() => {
    if (!query.data?.selectedOption) return;
    const option = query.data.selectedOption as ExperienceOptionId;
    if (OPTION_IDS.includes(option)) {
      setSelectedOption(option);
    }
  }, [query.data?.selectedOption]);

  // Mutation para persistir a resposta da etapa experience
  const mutation = useMutation({
    mutationFn: (option: ExperienceOptionId) =>
      savePreQuestionnaireStep(journeyId as string, EXPERIENCE_STEP_ID, {
        selectedOption: option,
      }),
    onSuccess: () => {
      // Navega para a próxima etapa: Nível de Proficiência em Inglês
      if (NEXT_STEP) {
        router.push(getCurrentJourneyStepUrl(NEXT_STEP));
      }
    },
  });

  // A pergunta depende do domínio da jornada; sem ele não é possível responder
  const isContinueDisabled = !journeyContext.domain;

  const handleSelectOption = (id: ExperienceOptionId) => {
    setSelectedOption(id);
  };

  const handleContinue = () => {
    if (!selectedOption || isContinueDisabled || mutation.isPending) return;
    mutation.mutate(selectedOption);
  };

  // Primeira etapa do pré-questionário: volta para o resumo da jornada
  const handleBack = () => {
    router.push(journeyId ? getJourneySummaryUrl(journeyId) : JOURNEYS_HREF);
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

  // Reexecuta o que falhou: as buscas (contexto da jornada e etapa) ou o salvamento
  const handleRetry = () => {
    if (journeyContext.isError || query.isError) {
      if (journeyContext.isError) journeyContext.refetch();
      if (query.isError) query.refetch();
      return;
    }
    if (mutation.isError && selectedOption) {
      mutation.mutate(selectedOption);
    }
  };

  const labels: ExperienceStepLabels = {
    stepTag: t("experience.stepTag"),
    title: t("experience.title"),
    description: t("experience.description"),
    questionLabels: {
      privacy: t("experience.questionLabel.privacy"),
      security: t("experience.questionLabel.security"),
      joint: t("experience.questionLabel.joint"),
    },
    options: {
      none: t("experience.options.none"),
      "less-than-1-year": t("experience.options.less-than-1-year"),
      "1-3-years": t("experience.options.1-3-years"),
      "4-6-years": t("experience.options.4-6-years"),
      "7-10-years": t("experience.options.7-10-years"),
      "10-plus-years": t("experience.options.10-plus-years"),
    },
    backLabel: t("actions.back"),
    backAriaLabel: t("header.backToSummaryAriaLabel"),
    continueLabel: t("actions.continue"),
    savingLabel: t("actions.saving"),
    exitLabel: t("header.exitButton"),
    exitAriaLabel: t("header.exitAriaLabel"),
    exitModal: {
      title: t("exitModal.title"),
      description: t("exitModal.description"),
      cancelButton: t("exitModal.cancelButton"),
      confirmButton: t("exitModal.confirmButton"),
    },
    loadingText: t("loading"),
    errorTitle: t("errorTitle"),
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
    notFoundTitle: t("noOngoingJourneyTitle"),
    notFoundMessage: t("noOngoingJourneyMessage"),
    backToJourneysLink: t("backToJourneysLink"),
  };

  const options: ExperienceOption[] = OPTION_IDS.map((id) => ({
    id,
    label: labels.options[id],
  }));

  const questionLabel = journeyContext.domain
    ? labels.questionLabels[journeyContext.domain]
    : "";

  const error =
    (journeyContext.isError && !journeyContext.isNotFound) ||
    query.isError ||
    (!journeyContext.isLoading && !journeyContext.isNotFound && !journeyContext.domain)
      ? labels.errorMessage
      : mutation.isError
        ? t("saveError")
        : null;

  return {
    journeyTitle: journeyContext.profileName ?? "",
    questionLabel,
    selectedOption,
    isLoading: query.isLoading || journeyContext.isLoading,
    isSubmitting: mutation.isPending,
    isContinueDisabled,
    isNotFound: journeyContext.isNotFound,
    isExitModalOpen,
    error,
    options,
    labels,
    journeysHref: JOURNEYS_HREF,
    handleSelectOption,
    handleContinue,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  };
}
