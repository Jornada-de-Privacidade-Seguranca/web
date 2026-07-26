import { env } from "@shared/config/env";
import type {
  PendingAssessment,
  LastCompletedAssessment,
  HistoryItem,
  DashboardDataResponse,
} from "@features/painel/painel.types";

function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getPendingAssessment(
  token?: string
): Promise<PendingAssessment | null> {
  const response = await fetch(`${env.API_URL}/dashboard/pending`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Erro ao carregar a avaliação pendente.");
  }

  const data = await response.json();
  return data ?? null;
}

export async function getLastCompletedAssessment(
  token?: string
): Promise<LastCompletedAssessment | null> {
  const response = await fetch(`${env.API_URL}/dashboard/last-completed`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Erro ao carregar a última avaliação concluída.");
  }

  const data = await response.json();
  return data ?? null;
}

export async function getRecentHistory(
  limit: number,
  token?: string
): Promise<HistoryItem[]> {
  const response = await fetch(`${env.API_URL}/dashboard/history?limit=${limit}`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Erro ao carregar o histórico recente.");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getDashboardData(
  limit: number,
  token?: string
): Promise<DashboardDataResponse> {
  const [pending, lastCompleted, history] = await Promise.all([
    getPendingAssessment(token),
    getLastCompletedAssessment(token),
    getRecentHistory(limit, token),
  ]);

  return {
    pending,
    lastCompleted,
    history,
  };
}
