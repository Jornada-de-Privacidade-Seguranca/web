import { env } from "@shared/config/env";
import type {
  PendingAssessment,
  LastCompletedAssessment,
  HistoryItem,
  DashboardDataResponse,
} from "@features/painel/painel.types";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleApiResponse<T>(
  response: Response,
  defaultErrorMessage: string
): Promise<T> {
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    if (
      json &&
      typeof json === "object" &&
      "message" in json &&
      typeof (json as ApiResponse<unknown>).message === "string"
    ) {
      throw new Error((json as ApiResponse<unknown>).message);
    }
    throw new Error(defaultErrorMessage);
  }

  if (json && typeof json === "object" && "data" in json) {
    const apiResponse = json as ApiResponse<T>;
    if (apiResponse.success === false) {
      throw new Error(apiResponse.message || defaultErrorMessage);
    }
    return apiResponse.data;
  }

  return json as T;
}

export async function getPendingAssessment(
  token?: string
): Promise<PendingAssessment | null> {
  const response = await fetch(`${env.API_URL}/dashboard/pending`, {
    headers: getAuthHeaders(token),
  });

  const data = await handleApiResponse<PendingAssessment | null>(
    response,
    "Erro ao carregar a avaliação pendente."
  );
  return data ?? null;
}

export async function getLastCompletedAssessment(
  token?: string
): Promise<LastCompletedAssessment | null> {
  const response = await fetch(`${env.API_URL}/dashboard/last-completed`, {
    headers: getAuthHeaders(token),
  });

  const data = await handleApiResponse<LastCompletedAssessment | null>(
    response,
    "Erro ao carregar a última avaliação concluída."
  );
  return data ?? null;
}

export async function getRecentHistory(
  limit: number,
  token?: string
): Promise<HistoryItem[]> {
  const response = await fetch(`${env.API_URL}/dashboard/history?limit=${limit}`, {
    headers: getAuthHeaders(token),
  });

  const data = await handleApiResponse<HistoryItem[] | null>(
    response,
    "Erro ao carregar o histórico recente."
  );
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
