"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiRequestError } from "@services/httpClient";
import {
  downloadJourneyResultPdf,
  getJourneyResult,
  JourneyResultRequestError,
} from "@services/journeyResultService";
import { saveBlobAsFile } from "@shared/utils/fileDownload";
import { getProfileSummaryUrl } from "@shared/utils/journeyRoutes";
import { buildJourneyResultModel, buildScoreValue } from "./journeyResult.utils";
import type {
  JourneyResultErrorLabels,
  JourneyResultErrorType,
  JourneyResultFormatters,
  JourneyResultLabels,
  JourneyResultModel,
  JourneyResultTranslate,
  JourneyResultViewModelReturn,
} from "./journeyResult.types";

const RESULTS_HREF = "/resultados";

/** Nota mínima recomendada em cada área, indicada pelo marcador das barras. */
export const RECOMMENDED_AREA_SCORE = 60;

export const JOURNEY_RESULT_QUERY_KEY = "journey-result";

const EMPTY_MODEL: Omit<JourneyResultModel, "score"> = {
  journeyTitle: "",
  declaredCount: 0,
  totalCompetencies: 0,
  isJointJourney: false,
  areaScoreGroups: [],
  declaredCompetencies: [],
  undeclaredCompetencies: [],
};

export function useJourneyResultVM(journeyId: string): JourneyResultViewModelReturn {
  const t = useTranslations("journeyResult");
  const isEnglish = useLocale() === "en";

  const query = useQuery({
    queryKey: [JOURNEY_RESULT_QUERY_KEY, journeyId],
    queryFn: () => getJourneyResult(journeyId),
    enabled: Boolean(journeyId),
    // Só a falha de servidor pode se resolver com nova tentativa, e ela é manual
    retry: false,
  });

  const journey = query.data ?? null;

  const formatters: JourneyResultFormatters = useMemo(
    () => ({
      localize: (pt, en) => (isEnglish ? en : pt) || pt || en || "",
      bandLabel: (band) => t(`bands.${band}`),
      scoreAriaLabel: (name, score) =>
        t("scoreAriaLabel", { name, band: score.bandLabel, score: score.value }),
      areaCountText: (declared, total) => t("areas.count", { declared, total }),
      groupCountText: (count) => t("competencies.groupCount", { count }),
      otherAreaLabel: t("areas.otherAreaLabel"),
      otherDomainLabel: t("areas.otherDomainLabel"),
    }),
    [isEnglish, t]
  );

  const isCompleted = journey?.status === "completed";

  const model: JourneyResultModel = useMemo(
    () =>
      journey && isCompleted
        ? buildJourneyResultModel(journey, formatters)
        : { ...EMPTY_MODEL, score: buildScoreValue(0, formatters.bandLabel) },
    [journey, isCompleted, formatters]
  );

  // Durante a nova tentativa a query segue em erro; a tela mostra o carregamento
  const isRetrying = query.isError && query.isFetching;

  let error: JourneyResultErrorType | null = null;
  if (!journeyId) {
    error = "not_found";
  } else if (query.isError && !isRetrying) {
    error =
      query.error instanceof JourneyResultRequestError ? query.error.type : "server_error";
  } else if (journey && !isCompleted) {
    error = "not_completed";
  }

  // Refazer (ou continuar) parte do resumo do perfil, de onde a jornada é iniciada
  const profileId = journey?.journey_profile?.id;
  const retakeUrl = profileId ? getProfileSummaryUrl(String(profileId)) : RESULTS_HREF;

  const labels: JourneyResultLabels = {
    pageTitle: t("pageTitle"),
    loadingAriaLabel: t("loadingAriaLabel"),
    overallLabel: t("overallLabel"),
    overallScoreAriaLabel: t("scoreAriaLabel", {
      name: t("overallLabel"),
      band: model.score.bandLabel,
      score: model.score.value,
    }),
    declaredCountText: t("declaredCount", {
      declared: model.declaredCount,
      total: model.totalCompetencies,
    }),
    retakeButton: t("retakeButton"),
    backButton: t("backButton"),
    areas: {
      eyebrow: t("areas.eyebrow"),
      title: t("areas.title"),
      recommendation: t("areas.recommendation"),
      markerAriaLabel: t("areas.markerAriaLabel", { value: RECOMMENDED_AREA_SCORE }),
    },
    competencies: {
      eyebrow: t("competencies.eyebrow"),
      declaredTitle: t("competencies.declaredTitle"),
      undeclaredTitle: t("competencies.undeclaredTitle"),
      emptyGroup: t("competencies.emptyGroup"),
      difficultyPrefix: t("competencies.difficultyPrefix"),
      domainPrefix: t("competencies.domainPrefix"),
    },
    pdf: {
      downloadButton: t("pdf.downloadButton"),
      generatingLabel: t("pdf.generatingLabel"),
    },
    errors: error ? buildErrorLabels(error, retakeUrl, t) : null,
  };

  const handleRetry = () => {
    void query.refetch();
  };

  const pdfMutation = useMutation({
    mutationFn: () => downloadJourneyResultPdf(journeyId, isEnglish ? "en" : "pt"),
    onSuccess: ({ blob, filename }) => saveBlobAsFile(blob, filename),
  });

  // O 401 já leva ao login pelo tratamento de sessão expirada; não há o que mostrar aqui
  const isSessionExpired =
    pdfMutation.error instanceof ApiRequestError && pdfMutation.error.status === 401;
  const pdfError = pdfMutation.isError && !isSessionExpired ? t("pdf.error") : null;

  const handleDownloadPdf = () => {
    if (pdfMutation.isPending) return;
    pdfMutation.mutate();
  };

  return {
    ...model,
    retakeUrl,
    resultsUrl: RESULTS_HREF,
    recommendedAreaScore: RECOMMENDED_AREA_SCORE,
    isLoading: query.isLoading || isRetrying,
    error,
    labels,
    handleRetry,
    canDownloadPdf: Boolean(journey) && isCompleted,
    isDownloadingPdf: pdfMutation.isPending,
    pdfError,
    handleDownloadPdf,
  };
}

/**
 * Mensagem de cada erro. A jornada em andamento leva ao resumo do perfil; a
 * falha de servidor oferece nova tentativa; os demais voltam para Resultados.
 */
function buildErrorLabels(
  error: JourneyResultErrorType,
  retakeUrl: string,
  t: JourneyResultTranslate
): JourneyResultErrorLabels {
  const backToResults = { linkText: t("errors.backToResultsLink"), linkHref: RESULTS_HREF };

  switch (error) {
    case "not_found":
      return {
        title: t("errors.notFoundTitle"),
        message: t("errors.notFoundMessage"),
        ...backToResults,
        retryButton: null,
      };
    case "forbidden":
      return {
        title: t("errors.forbiddenTitle"),
        message: t("errors.forbiddenMessage"),
        ...backToResults,
        retryButton: null,
      };
    case "not_completed":
      return {
        title: t("errors.notCompletedTitle"),
        message: t("errors.notCompletedMessage"),
        linkText: t("errors.goToSummaryLink"),
        linkHref: retakeUrl,
        retryButton: null,
      };
    case "incomplete":
      return {
        title: t("errors.incompleteTitle"),
        message: t("errors.incompleteMessage"),
        ...backToResults,
        retryButton: null,
      };
    case "server_error":
      return {
        title: t("errors.serverErrorTitle"),
        message: t("errors.serverErrorMessage"),
        ...backToResults,
        retryButton: t("errors.retryButton"),
      };
  }
}
