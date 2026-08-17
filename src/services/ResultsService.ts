import { env } from "@shared/config/env";
import type {
  ResultItem,
  ResultsMetrics,
  PaginatedResponse,
} from "@features/results/results.types";

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

export interface GetResultsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getMetrics(token?: string): Promise<ResultsMetrics> {
  const response = await fetch(`${env.API_URL}/results/metrics`, {
    headers: getAuthHeaders(token),
  });

  return handleApiResponse<ResultsMetrics>(
    response,
    "Erro ao carregar as métricas de resultados."
  );
}

export async function getResultsList(
  params: GetResultsListParams = {},
  token?: string
): Promise<PaginatedResponse<ResultItem>> {
  const { page = 1, limit = 6, search = "" } = params;
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) {
    searchParams.append("search", search);
  }

  const response = await fetch(
    `${env.API_URL}/results?${searchParams.toString()}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return handleApiResponse<PaginatedResponse<ResultItem>>(
    response,
    "Erro ao carregar os resultados das avaliações."
  );
}
