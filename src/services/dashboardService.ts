import { ApiRequestError, apiRequest } from "@services/httpClient";
import { env } from "@shared/config/env";
import type {
  PendingAssessment,
  LastCompletedAssessment,
  HistoryItem,
  DashboardMetrics,
  DashboardDataResponse,
} from "@features/painel/painel.types";

export const MOCK_PENDING_ASSESSMENT: PendingAssessment = {
  id: "1",
  title: "Encarregado pelo Tratamento de Dados Pessoais",
  description:
    "Avaliação de competências em conformidade com a LGPD e boas práticas de segurança da informação.",
  status: "in_progress",
  totalQuestions: 15,
  estimatedMinutes: 20,
  currentStep: "competencias",
  progressPercent: 65,
  knowledgeDomain: "privacy",
};

export const MOCK_LAST_COMPLETED: LastCompletedAssessment = {
  id: "101",
  title: "Gestor de Segurança da Informação",
  completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  score: 88,
};

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "101",
    title: "Gestor de Segurança da Informação",
    completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    score: 88,
  },
  {
    id: "102",
    title: "Controlador",
    completedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    score: 92,
  },
  {
    id: "103",
    title: "Operador",
    completedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    score: 79,
  },
];

export const MOCK_METRICS: DashboardMetrics = {
  completedJourneys: 3,
  pendingJourneys: 1,
  averageScore: 86,
};

function isNetworkError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === undefined;
}

export async function getPendingAssessment(): Promise<PendingAssessment | null> {
  try {
    const data = await apiRequest<PendingAssessment | null>(
      "/dashboard/pending",
      {},
      "Failed to fetch pending journey."
    );
    return data ?? null;
  } catch (error) {
    if (env.isDev && isNetworkError(error)) {
      return MOCK_PENDING_ASSESSMENT;
    }
    throw error;
  }
}

export async function getLastCompletedAssessment(): Promise<LastCompletedAssessment | null> {
  try {
    const data = await apiRequest<LastCompletedAssessment | null>(
      "/dashboard/last-completed",
      {},
      "Failed to fetch last completed journey."
    );
    return data ?? null;
  } catch (error) {
    if (env.isDev && isNetworkError(error)) {
      return MOCK_LAST_COMPLETED;
    }
    throw error;
  }
}

export async function getRecentHistory(limit: number): Promise<HistoryItem[]> {
  try {
    const data = await apiRequest<HistoryItem[] | null>(
      "/dashboard/history",
      { params: { limit } },
      "Failed to fetch journey history."
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (env.isDev && isNetworkError(error)) {
      return MOCK_HISTORY.slice(0, limit);
    }
    throw error;
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const data = await apiRequest<DashboardMetrics | null>(
      "/dashboard/metrics",
      {},
      "Failed to fetch dashboard metrics."
    );
    return (
      data ?? {
        completedJourneys: 0,
        pendingJourneys: 0,
        averageScore: 0,
      }
    );
  } catch (error) {
    if (env.isDev && isNetworkError(error)) {
      return MOCK_METRICS;
    }
    throw error;
  }
}

export async function getDashboardData(
  limit: number
): Promise<DashboardDataResponse> {
  const [pending, lastCompleted, history, metrics] = await Promise.all([
    getPendingAssessment(),
    getLastCompletedAssessment(),
    getRecentHistory(limit),
    getDashboardMetrics(),
  ]);

  return {
    pending,
    lastCompleted,
    history,
    metrics,
  };
}
