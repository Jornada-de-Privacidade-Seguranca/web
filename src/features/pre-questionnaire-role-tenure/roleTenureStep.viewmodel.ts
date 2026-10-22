"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter, usePathname } from "@shared/i18n/navigation";
import { useJourneyContext } from "@hooks/useJourneyContext";
import {
  getPreQuestionnaireStep,
  savePreQuestionnaireStep,
} from "@services/preQuestionnaireService";
import {
  getJourneyRoutePrefix,
  getJourneyStepUrl,
  getNextPreQuestionnaireStep,
  getPreviousPreQuestionnaireStep,
  formatJourneyTitleFromSlug,
} from "@shared/utils/journeyRoutes";
import {
  ROLE_TENURE_STEP_ID,
  type RoleTenureOptionId,
  type RoleTenureOption,
  type RoleTenureStepLabels,
  type RoleTenureStepViewModelReturn,
} from "./roleTenureStep.types";

const OPTION_IDS: RoleTenureOptionId[] = [
  "0-years",
  "1-3-years",
  "4-6-years",
  "7-10-years",
  "10-plus-years",
];

const NEXT_STEP = getNextPreQuestionnaireStep("tempo-atuacao-perfil");
const PREVIOUS_STEP = getPreviousPreQuestionnaireStep("tempo-atuacao-perfil");

export function useRoleTenureStepVM(
  journeySlug: string
): RoleTenureStepViewModelReturn {
  const t = useTranslations("preQuestionnaire");
  const router = useRouter();
  const pathname = usePathname();
  const routePrefix = getJourneyRoutePrefix(pathname);
  const { profileName } = useJourneyContext(journeySlug);

  const [selectedOption, setSelectedOption] = useState<RoleTenureOptionId | null>(
    null
  );
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Busca dados previamente salvos da etapa role-tenure
  const query = useQuery({
    queryKey: ["pre-questionnaire", journeySlug, ROLE_TENURE_STEP_ID],
    queryFn: () => getPreQuestionnaireStep(journeySlug, ROLE_TENURE_STEP_ID),
    enabled: Boolean(journeySlug),
    retry: 1,
  });

  // Atualiza a opção pré-selecionada caso venha do backend
  useEffect(() => {
    if (query.data?.selectedOption) {
      const option = query.data.selectedOption as RoleTenureOptionId;
      if (OPTION_IDS.includes(option)) {
        setSelectedOption(option);
      }
    }
  }, [query.data?.selectedOption]);

  // Mutation para persistir a resposta da etapa role-tenure
  const mutation = useMutation({
    mutationFn: (option: RoleTenureOptionId) =>
      savePreQuestionnaireStep(journeySlug, ROLE_TENURE_STEP_ID, {
        selectedOption: option,
      }),
    onSuccess: () => {
      // Navega para a próxima etapa: Formação Acadêmica
      if (NEXT_STEP) {
        router.push(getJourneyStepUrl(routePrefix, journeySlug, NEXT_STEP));
      }
    },
  });

  const handleSelectOption = (id: RoleTenureOptionId) => {
    setSelectedOption(id);
  };

  const handleContinue = () => {
    if (!selectedOption || mutation.isPending) return;
    mutation.mutate(selectedOption);
  };

  const handleBack = () => {
    // Retorna para a etapa anterior: Nível de Proficiência em Inglês
    if (PREVIOUS_STEP) {
      router.push(getJourneyStepUrl(routePrefix, journeySlug, PREVIOUS_STEP));
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
    if (query.isError) {
      query.refetch();
      return;
    }
    if (mutation.isError && selectedOption) {
      mutation.mutate(selectedOption);
    }
  };

  const labels: RoleTenureStepLabels = {
    stepTag: t("roleTenure.stepTag"),
    title: t("roleTenure.title"),
    description: t("roleTenure.description"),
    questionLabel: t("roleTenure.questionLabel"),
    options: {
      "0-years": t("roleTenure.options.0-years"),
      "1-3-years": t("roleTenure.options.1-3-years"),
      "4-6-years": t("roleTenure.options.4-6-years"),
      "7-10-years": t("roleTenure.options.7-10-years"),
      "10-plus-years": t("roleTenure.options.10-plus-years"),
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
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
  };

  const options: RoleTenureOption[] = OPTION_IDS.map((id) => ({
    id,
    label: labels.options[id],
  }));

  const journeyTitle =
    profileName ??
    query.data?.journeyTitle ??
    formatJourneyTitleFromSlug(journeySlug);

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
