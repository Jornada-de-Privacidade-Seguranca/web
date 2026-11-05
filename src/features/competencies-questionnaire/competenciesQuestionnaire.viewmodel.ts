"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@shared/i18n/navigation";
import { CURRENT_JOURNEY_QUERY_KEY, useJourneyContext } from "@hooks/useJourneyContext";
import { ApiRequestError } from "@services/httpClient";
import {
  finalizeCurrentJourney,
  getCompetencyOptions,
  getSavedCompetencies,
  saveCompetencies,
} from "@services/competenciesService";
import { resolveDifficultyLevel } from "@shared/utils/difficultyLevel";
import {
  getCompetenciesAreaUrl,
  getJourneyResultUrl,
  getJourneySummaryUrl,
} from "@shared/utils/journeyRoutes";
import { useCompetenciesQuestionnaireStore } from "./competenciesQuestionnaire.store";
import type {
  CompetenciesQuestionnaireLabels,
  CompetenciesQuestionnaireViewModelReturn,
  CompetencyAnswerPayload,
  CompetencyAnswerResponse,
  CompetencyAnswers,
  CompetencyArea,
  CompetencyItem,
  CompetencyOptionResponse,
  JourneyFinalizationResponse,
} from "./competenciesQuestionnaire.types";

const JOURNEYS_HREF = "/jornadas";
const RESULTS_HREF = "/resultados";

/** Área das competências sem área de conhecimento (sempre a última). */
const OTHER_AREA_ID = "other";

const OPTIONS_QUERY_KEY = ["questionnaire", "current", "competencies", "options"];
const SAVED_QUERY_KEY = ["questionnaire", "current", "competencies", "saved"];

type SubmitMode = "next" | "finish";
type SubmitStep = "save" | "finalize";

function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 404;
}

// Jornada inexistente não se resolve com nova tentativa
function retryUnlessNotFound(failureCount: number, error: unknown): boolean {
  return !isNotFoundError(error) && failureCount < 1;
}

/** Índice da rota (base 0); null quando não é um inteiro não negativo. */
function parseAreaIndex(param: string): number | null {
  return /^\d+$/.test(param) ? Number(param) : null;
}

function answersFromSaved(saved: CompetencyAnswerResponse[]): CompetencyAnswers {
  const answers: CompetencyAnswers = {};
  for (const item of saved) {
    answers[item.competency.id] = item.acquired;
  }
  return answers;
}

export function useCompetenciesQuestionnaireVM(
  areaIndexParam: string
): CompetenciesQuestionnaireViewModelReturn {
  const t = useTranslations("questionnaire");
  const isEnglish = useLocale() === "en";
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    journeyId,
    profileName,
    isLoading: isJourneyContextLoading,
    isNotFound: isJourneyContextNotFound,
  } = useJourneyContext();

  const storeJourneyId = useCompetenciesQuestionnaireStore((state) => state.journeyId);
  const answers = useCompetenciesQuestionnaireStore((state) => state.answers);
  const hydrate = useCompetenciesQuestionnaireStore((state) => state.hydrate);
  const setAnswer = useCompetenciesQuestionnaireStore((state) => state.setAnswer);
  const resetAnswers = useCompetenciesQuestionnaireStore((state) => state.reset);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [failedStep, setFailedStep] = useState<SubmitStep | null>(null);
  // Última lista enviada com sucesso: ao repetir uma finalização que falhou,
  // o salvamento só é refeito se as respostas tiverem mudado
  const lastSavedSignatureRef = useRef<string | null>(null);
  const submitStepRef = useRef<SubmitStep>("save");
  const lastModeRef = useRef<SubmitMode>("next");

  const optionsQuery = useQuery({
    queryKey: OPTIONS_QUERY_KEY,
    queryFn: getCompetencyOptions,
    retry: retryUnlessNotFound,
  });

  const savedQuery = useQuery({
    queryKey: SAVED_QUERY_KEY,
    queryFn: getSavedCompetencies,
    retry: retryUnlessNotFound,
  });

  // As respostas salvas preenchem a store uma vez por jornada; depois disso, a
  // store é a fonte das respostas enquanto o usuário navega entre as áreas
  const isHydrated = journeyId !== null && storeJourneyId === journeyId;
  useEffect(() => {
    if (journeyId && savedQuery.data && storeJourneyId !== journeyId) {
      hydrate(journeyId, answersFromSaved(savedQuery.data));
    }
  }, [journeyId, savedQuery.data, storeJourneyId, hydrate]);

  // Áreas ordenadas pelo id da área; competências sem área vão para a última
  const otherAreaLabel = t("areas.otherAreaLabel");
  const areas: CompetencyArea[] = useMemo(() => {
    const byArea = new Map<string, CompetencyArea & { sortId: number }>();
    const localized = (pt?: string | null, en?: string | null) =>
      (isEnglish ? en : pt) || pt || en || "";

    for (const option of optionsQuery.data ?? []) {
      const area = option.knowledge_area;
      const areaId = area ? String(area.id) : OTHER_AREA_ID;
      if (!byArea.has(areaId)) {
        const description = area
          ? localized(area.description_pt, area.description_en)
          : "";
        byArea.set(areaId, {
          id: areaId,
          sortId: area ? area.id : Number.POSITIVE_INFINITY,
          name: area ? localized(area.name_pt, area.name_en) : otherAreaLabel,
          description: description || null,
          competencies: [],
        });
      }
      byArea.get(areaId)?.competencies.push(toCompetencyItem(option, localized));
    }

    return [...byArea.values()]
      .sort((a, b) => a.sortId - b.sortId)
      .map((area) => ({
        id: area.id,
        name: area.name,
        description: area.description,
        competencies: area.competencies,
      }));
  }, [optionsQuery.data, isEnglish, otherAreaLabel]);

  const totalAreas = areas.length;
  const parsedAreaIndex = parseAreaIndex(areaIndexParam);
  const isAreaIndexValid = parsedAreaIndex !== null && parsedAreaIndex < totalAreas;
  const areaIndex = isAreaIndexValid ? parsedAreaIndex : 0;
  const currentArea = areas[areaIndex] ?? null;
  const isLastArea = totalAreas > 0 && areaIndex === totalAreas - 1;

  // Índice inválido ou fora do intervalo redireciona para a primeira área
  useEffect(() => {
    if (optionsQuery.isSuccess && totalAreas > 0 && !isAreaIndexValid) {
      router.replace(getCompetenciesAreaUrl(0));
    }
  }, [optionsQuery.isSuccess, totalAreas, isAreaIndexValid, router]);

  const allCompetencies = useMemo(() => areas.flatMap((area) => area.competencies), [areas]);
  const answeredTotal = allCompetencies.filter((c) => answers[c.id] !== undefined).length;
  const progressPercent =
    allCompetencies.length > 0 ? Math.round((answeredTotal / allCompetencies.length) * 100) : 0;

  const areaTotalCount = currentArea?.competencies.length ?? 0;
  const areaAnsweredCount =
    currentArea?.competencies.filter((c) => answers[c.id] !== undefined).length ?? 0;

  // O PUT substitui a lista inteira: só envia as competências do perfil atual
  const buildPayload = (): CompetencyAnswerPayload[] =>
    allCompetencies
      .filter((competency) => answers[competency.id] !== undefined)
      .map((competency) => ({
        competency_id: competency.id,
        acquired: answers[competency.id],
      }));

  const mutation = useMutation({
    mutationFn: async (mode: SubmitMode): Promise<JourneyFinalizationResponse | null> => {
      const payload = buildPayload();
      const signature = JSON.stringify(payload);

      if (mode === "next" || signature !== lastSavedSignatureRef.current) {
        submitStepRef.current = "save";
        const saved = await saveCompetencies(payload);
        lastSavedSignatureRef.current = signature;
        queryClient.setQueryData(SAVED_QUERY_KEY, saved);
      }

      if (mode === "next") return null;

      submitStepRef.current = "finalize";
      return finalizeCurrentJourney();
    },
    onMutate: () => {
      setFailedStep(null);
    },
    onError: () => {
      setFailedStep(submitStepRef.current);
    },
    onSuccess: (finalization, mode) => {
      if (mode === "next") {
        router.push(getCompetenciesAreaUrl(areaIndex + 1));
        return;
      }
      // Jornada concluída: as respostas em memória não servem mais
      resetAnswers();
      void queryClient.invalidateQueries({ queryKey: CURRENT_JOURNEY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["journey-summary"] });
      const finishedJourneyId = finalization?.journey_id ?? journeyId;
      router.push(
        finishedJourneyId ? getJourneyResultUrl(String(finishedJourneyId)) : RESULTS_HREF
      );
    },
  });

  const isAreaComplete = areaTotalCount > 0 && areaAnsweredCount === areaTotalCount;

  // Sem as respostas salvas carregadas, o PUT apagaria o que já foi salvo
  const isNextDisabled =
    !savedQuery.isSuccess || !isHydrated || !isAreaComplete || mutation.isPending;

  const submit = (mode: SubmitMode) => {
    lastModeRef.current = mode;
    mutation.mutate(mode);
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    submit(isLastArea ? "finish" : "next");
  };

  const handleAnswer = (competencyId: number, acquired: boolean) => {
    if (mutation.isPending) return;
    setAnswer(competencyId, acquired);
  };

  const handleBack = () => {
    if (mutation.isPending) return;
    // "Voltar" não salva: na primeira área volta para o resumo da jornada,
    // onde ficam as instruções
    if (areaIndex > 0) {
      router.push(getCompetenciesAreaUrl(areaIndex - 1));
      return;
    }
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
    // Respostas ainda não salvas são descartadas ao sair
    resetAnswers();
    router.push(JOURNEYS_HREF);
  };

  // Reexecuta o que falhou: as buscas ou o envio (salvar e/ou finalizar)
  const handleRetry = () => {
    if (optionsQuery.isError || savedQuery.isError) {
      if (optionsQuery.isError) void optionsQuery.refetch();
      if (savedQuery.isError) void savedQuery.refetch();
      return;
    }
    if (mutation.isError) {
      submit(lastModeRef.current);
    }
  };

  const mutationError = mutation.error;
  const isFinalizeError = mutation.isError && failedStep === "finalize";
  const isIncompleteJourney =
    isFinalizeError && mutationError instanceof ApiRequestError && mutationError.status === 422;
  const isJourneyAlreadyFinished =
    isFinalizeError && mutationError instanceof ApiRequestError && mutationError.status === 409;

  const isJourneyNotFound =
    isJourneyContextNotFound ||
    isNotFoundError(optionsQuery.error) ||
    isNotFoundError(savedQuery.error) ||
    isNotFoundError(mutationError);

  let error: string | null = null;
  if (optionsQuery.isError || savedQuery.isError) {
    error = t("errorMessage");
  } else if (mutation.isError) {
    // 422 (validação ao salvar ou jornada incompleta ao finalizar): mensagem do backend
    if (mutationError instanceof ApiRequestError && mutationError.status === 422) {
      error = mutationError.message;
    } else {
      error =
        failedStep === "finalize"
          ? t("areas.finalizeError")
          : t("saveError");
    }
  }

  const errorLink =
    isIncompleteJourney && journeyId
      ? { label: t("areas.summaryLink"), href: getJourneySummaryUrl(journeyId) }
      : null;

  const labels: CompetenciesQuestionnaireLabels = {
    journeyLabel: profileName ?? "",
    areaIndicator: t("areas.areaIndicator", {
      current: totalAreas > 0 ? areaIndex + 1 : 0,
      total: totalAreas,
    }),
    progressAriaLabel: t("areas.progressAriaLabel"),
    areaDescriptionPlaceholder: t("areas.areaDescriptionPlaceholder"),
    instruction: t("areas.instruction"),
    areaCounter: t("areas.areaCounter", {
      answered: areaAnsweredCount,
      total: areaTotalCount,
    }),
    yesLabel: t("areas.yes"),
    noLabel: t("areas.no"),
    difficultyPrefix: t("areas.difficultyPrefix"),
    emptyLabel: t("areas.emptyLabel"),
    backLabel: t("actions.back"),
    backAriaLabel: t("header.backAriaLabel"),
    nextLabel: isLastArea
      ? t("areas.finishButton")
      : t("areas.nextAreaButton"),
    savingLabel: isLastArea
      ? t("areas.finishing")
      : t("actions.saving"),
    exitLabel: t("header.exitButton"),
    exitAriaLabel: t("header.exitAriaLabel"),
    exitModal: {
      title: t("exitModal.title"),
      description: t("areas.exitModalDescription"),
      cancelButton: t("exitModal.cancelButton"),
      confirmButton: t("exitModal.confirmButton"),
    },
    loadingText: t("areas.loading"),
    retryButton: t("retryButton"),
    summaryLink: t("areas.summaryLink"),
    noOngoingJourneyTitle: t("noOngoingJourneyTitle"),
    noOngoingJourneyMessage: t("noOngoingJourneyMessage"),
    backToJourneysLink: t("backToJourneysLink"),
    alreadyFinishedTitle: t("areas.alreadyFinishedTitle"),
    alreadyFinishedMessage: t("areas.alreadyFinishedMessage"),
    goToResultsLink: t("areas.goToResultsLink"),
  };

  return {
    journeyTitle: profileName ?? "",
    currentArea,
    areaIndex,
    totalAreas,
    progressPercent,
    areaAnsweredCount,
    areaTotalCount,
    answers,
    isLastArea,
    isNextDisabled,
    isLoading:
      isJourneyContextLoading ||
      optionsQuery.isLoading ||
      savedQuery.isLoading ||
      (savedQuery.isSuccess && journeyId !== null && !isHydrated),
    isSubmitting: mutation.isPending,
    error,
    errorLink,
    canRetry: !isIncompleteJourney,
    isJourneyNotFound,
    isJourneyAlreadyFinished,
    isExitModalOpen,
    labels,
    journeysHref: JOURNEYS_HREF,
    resultsHref: RESULTS_HREF,
    handleAnswer,
    handleNext,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  };
}

function toCompetencyItem(
  option: CompetencyOptionResponse,
  localized: (pt?: string | null, en?: string | null) => string
): CompetencyItem {
  const difficulty = option.difficulty;
  return {
    id: option.id,
    name: localized(option.name_pt, option.name_en),
    description: localized(option.description_pt, option.description_en),
    difficulty: difficulty
      ? {
          level: resolveDifficultyLevel(difficulty.name_pt, difficulty.name_en),
          label: localized(difficulty.name_pt, difficulty.name_en),
        }
      : null,
  };
}
