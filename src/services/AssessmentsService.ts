import { env } from "@shared/config/env";
import type { Journey, PaginatedResponse } from "@features/assessments/assessments.types";

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

export interface GetPendingAssessmentsParams {
  page?: number;
  limit?: number;
}

export interface GetCatalogAssessmentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getPendingAssessments(
  params: GetPendingAssessmentsParams = {},
  token?: string
): Promise<PaginatedResponse<Journey>> {
  const { page = 1, limit = 6 } = params;
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${env.API_URL}/assessments/pending?${searchParams.toString()}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return handleApiResponse<PaginatedResponse<Journey>>(
    response,
    "Erro ao carregar jornadas pendentes."
  );
}

export async function getCatalogAssessments(
  params: GetCatalogAssessmentsParams = {},
  token?: string
): Promise<PaginatedResponse<Journey>> {
  const { page = 1, limit = 6, search = "" } = params;
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) {
    searchParams.append("search", search);
  }

  const response = await fetch(
    `${env.API_URL}/assessments?${searchParams.toString()}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return handleApiResponse<PaginatedResponse<Journey>>(
    response,
    "Erro ao carregar catálogo de jornadas."
  );
}
