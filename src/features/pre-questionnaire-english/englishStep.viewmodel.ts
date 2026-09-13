"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter, usePathname } from "@shared/i18n/navigation";
import {
  getPreQuestionnaireStep,
  savePreQuestionnaireStep,
} from "@services/preQuestionnaireService";
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

export function useEnglishStepVM(
  journeySlug: string
): EnglishStepViewModelReturn {
  const t = useTranslations("preQuestionnaire");
  const router = useRouter();
  const pathname = usePathname();
  const routePrefix = pathname?.startsWith("/jornada") ? "jornada" : "journey";

  const [selectedOption, setSelectedOption] = useState<EnglishOptionId | null>(
    null
  );
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Busca dados previamente salvos da etapa
  const query = useQuery({
    queryKey: ["pre-questionnaire", journeySlug, "english"],
    queryFn: () => getPreQuestionnaireStep(journeySlug, "english"),
    enabled: Boolean(journeySlug),
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
      savePreQuestionnaireStep(journeySlug, "english", {
        selectedOption: option,
      }),
    onSuccess: () => {
      // Navega para a próxima etapa: Tempo de Atuação no Perfil
      router.push(`/${routePrefix}/${journeySlug}/tempo-atuacao-perfil`);
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
    router.push(`/${routePrefix}/${journeySlug}/experiencia-profissional`);
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

  const handleRetry = () => {
    query.refetch();
  };

  const labels: EnglishStepLabels = {
    stepTag: t("header.stepTag"),
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
  };

  const options: EnglishOption[] = OPTION_IDS.map((id) => ({
    id,
    label: labels.options[id],
  }));

  const journeyTitle =
    query.data?.journeyTitle ??
    journeySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const error = query.isError
    ? labels.errorMessage
    : mutation.isError
      ? t("saveError")
      : null;

  return {
    journeySlug,
    journeyTitle,
    selectedOption,
    isLoading: query.isLoading,
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
