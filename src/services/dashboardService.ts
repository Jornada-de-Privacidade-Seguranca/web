import { apiRequest } from "@services/httpClient";
import type {
  PendingAssessment,
  LastCompletedAssessment,
  HistoryItem,
  DashboardDataResponse,
} from "@features/painel/painel.types";

export async function getPendingAssessment(): Promise<PendingAssessment | null> {
  const data = await apiRequest<PendingAssessment | null>(
    "/dashboard/pending",
    {},
    "Erro ao carregar a avaliação pendente."
  );
  return data ?? null;
}

export async function getLastCompletedAssessment(): Promise<LastCompletedAssessment | null> {
  const data = await apiRequest<LastCompletedAssessment | null>(
    "/dashboard/last-completed",
    {},
    "Erro ao carregar a última avaliação concluída."
  );
  return data ?? null;
}

export async function getRecentHistory(limit: number): Promise<HistoryItem[]> {
  const data = await apiRequest<HistoryItem[] | null>(
    "/dashboard/history",
    { params: { limit } },
    "Erro ao carregar o histórico recente."
  );
  return Array.isArray(data) ? data : [];
}

export async function getDashboardData(
  limit: number
): Promise<DashboardDataResponse> {
  const [pending, lastCompleted, history] = await Promise.all([
    getPendingAssessment(),
    getLastCompletedAssessment(),
    getRecentHistory(limit),
  ]);

  return {
    pending,
    lastCompleted,
    history,
  };
}
