import { apiRequest } from "@services/httpClient";
import { env } from "@shared/config/env";
import type {
  PendingAssessment,
  LastCompletedAssessment,
  HistoryItem,
  DashboardMetrics,
  DashboardDataResponse,
} from "@features/painel/painel.types";

const MOCK_PENDING_ASSESSMENT: PendingAssessment = {
  id: "1",
  title: "Jornada de Privacidade e Segurança",
  description:
    "Avaliação de competências em conformidade com a LGPD e boas práticas de segurança da informação.",
  status: "in_progress",
  totalQuestions: 15,
  estimatedMinutes: 20,
  currentStep: "competencias",
  progressPercent: 65,
  knowledgeDomain: "privacy",
};

const MOCK_LAST_COMPLETED: LastCompletedAssessment = {
  id: "101",
  title: "Fundamentos de Proteção de Dados (LGPD)",
  completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  score: 88,
};

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "101",
    title: "Fundamentos de Proteção de Dados (LGPD)",
    completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    score: 88,
  },
  {
    id: "102",
    title: "Segurança da Informação e Gestão de Incidentes",
    completedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    score: 92,
  },
  {
    id: "103",
    title: "Classificação da Informação e Controle de Acesso",
    completedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    score: 79,
  },
];

const MOCK_METRICS: DashboardMetrics = {
  completedJourneys: 3,
  pendingJourneys: 1,
  averageScore: 86,
};

export async function getPendingAssessment(): Promise<PendingAssessment | null> {
  try {
    const data = await apiRequest<PendingAssessment | null>(
      "/dashboard/pending",
      {},
      "Erro ao carregar a avaliação pendente."
    );
    return data ?? null;
  } catch (error) {
    if (env.isDev) {
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
      "Erro ao carregar a última avaliação concluída."
    );
    return data ?? null;
  } catch (error) {
    if (env.isDev) {
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
      "Erro ao carregar o histórico recente."
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (env.isDev) {
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
      "Erro ao carregar as métricas do painel."
    );
    return (
      data ?? {
        completedJourneys: 0,
        pendingJourneys: 0,
        averageScore: 0,
      }
    );
  } catch (error) {
    if (env.isDev) {
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
