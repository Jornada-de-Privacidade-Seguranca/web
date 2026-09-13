"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@shared/i18n/navigation";
import {
  getJourneySummary,
  JourneySummaryRequestError,
} from "@services/journeySummaryService";
import { resolveJourneyStartUrl } from "./journeySummary.utils";
import type {
  JourneySummaryViewModelReturn,
  JourneySummaryErrorType,
  JourneySummaryLabels,
  HowItWorksStep,
} from "./journeySummary.types";

export function useJourneySummaryVM(
  journeyId: string
): JourneySummaryViewModelReturn {
  const t = useTranslations("journeySummary");
  const router = useRouter();

  const query = useQuery({
    queryKey: ["journey-summary", "detail", journeyId],
    queryFn: () => getJourneySummary(journeyId),
    enabled: Boolean(journeyId),
    retry: false,
  });

  const journey = query.data ?? null;
  const isLoading = query.isLoading;

  const error: JourneySummaryErrorType | null = query.isError
    ? query.error instanceof JourneySummaryRequestError
      ? query.error.type
      : "server_error"
    : null;

  const ctaLabel = journey
    ? journey.status === "completed"
      ? t("actionRetake")
      : journey.status === "in_progress"
        ? t("actionContinue")
        : t("actionStart")
    : "";

  const resolvedStartUrl = journey ? resolveJourneyStartUrl(journey) : "";
  const ctaAriaLabel = journey ? `${ctaLabel} — ${journey.title}` : "";

  const onStartJourney = () => {
    if (!resolvedStartUrl) return;
    router.push(resolvedStartUrl);
  };

  const onDismiss = () => {
    router.back();
  };

  const rawSteps = t.raw("steps");
  const steps = (Array.isArray(rawSteps) ? rawSteps : []) as HowItWorksStep[];

  const labels: JourneySummaryLabels = {
    loadingTitle: t("loadingTitle"),
    subtitleStatic: t("subtitleStatic"),
    backToJourneysText: t("backToJourneys"),
    backToJourneysAriaLabel: t("backToJourneysAriaLabel"),
    badgeLabel: t("badgeLabel"),
    questionsLabel: t("questionsLabel"),
    durationLabel: t("durationLabel"),
    areasLabel: t("areasLabel"),
    competenciesLabel: t("competenciesLabel"),
    questionsAriaLabel: (count: number) => t("questionsAriaLabel", { count }),
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
  };

  return {
    journey,
    isLoading,
    error,
    ctaLabel,
    ctaAriaLabel,
    resolvedStartUrl,
    onStartJourney,
    onDismiss,
    labels,
  };
}
