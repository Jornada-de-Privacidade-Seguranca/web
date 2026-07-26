"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuthVM } from "@features/auth/auth.viewmodel";
import { getDashboardData } from "@services/dashboardService";
import { HISTORY_LIMIT } from "@shared/constants/dashboard";
import type {
  PainelViewModelReturn,
  PendingAssessment,
  LastCompletedAssessment,
  HistoryItem,
} from "./painel.types";

export function usePainelVM(): PainelViewModelReturn {
  const t = useTranslations("painel");
  const auth = useAuthVM();

  const userFirstName = auth.user?.firstName || auth.user?.name || "Usuário";
  const userToken = auth.user?.token;

  const [pendingAssessment, setPendingAssessment] =
    useState<PendingAssessment | null>(null);
  const [lastCompletedAssessment, setLastCompletedAssessment] =
    useState<LastCompletedAssessment | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getDashboardData(HISTORY_LIMIT, userToken);
      setPendingAssessment(data.pending);
      setLastCompletedAssessment(data.lastCompleted);
      setHistory(data.history);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("errorMessage") || "Ocorreu um erro ao carregar os dados do painel.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, t]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRetry = () => {
    fetchDashboard();
  };

  const labels = {
    greetingSubtitle: t("greetingSubtitle"),
    pendingSectionTitle: t("pendingSectionTitle"),
    completedSectionTitle: t("completedSectionTitle"),
    historySectionTitle: t("historySectionTitle"),
    pendingEmpty: t("pendingEmpty"),
    completedEmpty: t("completedEmpty"),
    historyEmpty: t("historyEmpty"),
    badgePending: t("badgePending"),
    badgeInProgress: t("badgeInProgress"),
    startAssessment: t("startAssessment"),
    continueAssessment: t("continueAssessment"),
    lastCompletionLabel: t("lastCompletionLabel"),
    scoreLabel: t("scoreLabel"),
    viewResult: t("viewResult"),
    errorTitle: t("errorTitle"),
    errorMessage: t("errorMessage"),
    retryButton: t("retryButton"),
  };

  return {
    userFirstName,
    greetingTitle: `Olá, ${userFirstName}`,
    greetingSubtitle: labels.greetingSubtitle,
    pendingAssessment,
    lastCompletedAssessment,
    history,
    isLoading,
    error,
    handleRetry,
    labels,
  };
}
