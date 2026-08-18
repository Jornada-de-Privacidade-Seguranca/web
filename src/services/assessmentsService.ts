import { apiRequest } from "@services/httpClient";
import type { Journey, PaginatedResponse } from "@features/assessments/assessments.types";

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
  params: GetPendingAssessmentsParams = {}
): Promise<PaginatedResponse<Journey>> {
  const { page = 1, limit = 6 } = params;
  return apiRequest<PaginatedResponse<Journey>>(
    "/assessments/pending",
    { params: { page, limit } },
    "Erro ao carregar jornadas pendentes."
  );
}

export async function getCatalogAssessments(
  params: GetCatalogAssessmentsParams = {}
): Promise<PaginatedResponse<Journey>> {
  const { page = 1, limit = 6, search } = params;
  return apiRequest<PaginatedResponse<Journey>>(
    "/assessments",
    { params: { page, limit, ...(search ? { search } : {}) } },
    "Erro ao carregar catálogo de jornadas."
  );
}
