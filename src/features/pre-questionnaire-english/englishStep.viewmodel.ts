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
  getNextPreQuestionnaireStep,
  getPreviousPreQuestionnaireStep,
} from "@shared/utils/journeyRoutes";
import type {
  EnglishOptionId,
  EnglishOption,
  EnglishStepLabels,
  EnglishStepViewModelReturn,
} from "./englishStep.types";

const OPTION_IDS: EnglishOptionId[] = [
  "none",
  "basic-reading",
  "intermediate-reading-writing",
  "advanced-fluent",
];

const NEXT_STEP = getNextPreQuestionnaireStep("english");
const PREVIOUS_STEP = getPreviousPreQuestionnaireStep("english");

export function useEnglishStepVM(): EnglishStepViewModelReturn {
  const t = useTranslations("preQuestionnaire");
  const router = useRouter();
  const journeyContext = useJourneyContext();
  const { journeyId, profileName } = journeyContext;

  const [selectedOption, setSelectedOption] = useState<EnglishOptionId | null>(
    null
  );
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Busca dados previamente salvos da etapa
  const query = useQuery({
    queryKey: ["pre-questionnaire", journeyId, "english"],
    queryFn: () => getPreQuestionnaireStep(journeyId as string, "english"),
    enabled: Boolean(journeyId),
    retry: 1,
  });

  // Atualiza a opção pré-selecionada caso venha do backend
  useEffect(() => {
    if (query.data?.selectedOption) {
      const option = query.data.selectedOption as EnglishOptionId;
      if (OPTION_IDS.includes(option)) {
        setSelectedOption(option);
      }
    }
  }, [query.data?.selectedOption]);

  // Mutation para persistir a resposta
  const mutation = useMutation({
    mutationFn: (option: EnglishOptionId) =>
      savePreQuestionnaireStep(journeyId as string, "english", {
        selectedOption: option,
      }),
    onSuccess: () => {
      // Navega para a próxima etapa: Tempo de Atuação no Perfil (introduzida no PR #68)
      if (NEXT_STEP) {
        router.push(getCurrentJourneyStepUrl(NEXT_STEP));
      }
    },
  });

  const handleSelectOption = (id: EnglishOptionId) => {
    setSelectedOption(id);
  };

  const handleContinue = () => {
    if (!selectedOption || mutation.isPending) return;
    mutation.mutate(selectedOption);
  };

  const handleBack = () => {
    // Retorna para a etapa anterior: Tempo de Experiência Profissional
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
    router.push("/jornadas");
  };

  // Reexecuta a operação que falhou: a busca da etapa ou o salvamento da resposta
  const handleRetry = () => {
    if (journeyContext.isError && !journeyContext.isNotFound) {
      journeyContext.refetch();
      return;
    }
    if (query.isError) {
      query.refetch();
      return;
    }
    if (mutation.isError && selectedOption) {
      mutation.mutate(selectedOption);
    }
  };

  const labels: EnglishStepLabels = {
    stepTag: t("english.stepTag"),
    title: t("english.title"),
    description: t("english.description"),
    questionLabel: t("english.questionLabel"),
    options: {
      none: t("english.options.none"),
      "basic-reading": t("english.options.basic-reading"),
      "intermediate-reading-writing": t("english.options.intermediate-reading-writing"),
      "advanced-fluent": t("english.options.advanced-fluent"),
    },
    backLabel: t("actions.back"),
    backAriaLabel: t("header.backAriaLabel"),
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
    noOngoingJourneyTitle: t("noOngoingJourneyTitle"),
    noOngoingJourneyMessage: t("noOngoingJourneyMessage"),
    backToJourneysLink: t("backToJourneysLink"),
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
  };

  const options: EnglishOption[] = OPTION_IDS.map((id) => ({
    id,
    label: labels.options[id],
  }));

  const journeyTitle = profileName ?? query.data?.journeyTitle ?? "";

  const error =
    (journeyContext.isError && !journeyContext.isNotFound) || query.isError
      ? labels.errorMessage
      : mutation.isError
        ? t("saveError")
        : null;

  return {
    journeyTitle,
    selectedOption,
    isLoading: query.isLoading || journeyContext.isLoading,
    isNotFound: journeyContext.isNotFound,
    journeysHref: "/jornadas",
    isSubmitting: mutation.isPending,
    isExitModalOpen,
    error,
    options,
    labels,
    handleSelectOption,
    handleContinue,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  };
}
