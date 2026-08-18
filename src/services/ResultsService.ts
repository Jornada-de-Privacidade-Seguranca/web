import { apiRequest } from "@services/httpClient";
import type {
  ResultItem,
  ResultsMetrics,
  PaginatedResponse,
} from "@features/results/results.types";

export interface GetResultsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getMetrics(): Promise<ResultsMetrics> {
  return apiRequest<ResultsMetrics>(
    "/results/metrics",
    {},
    "Erro ao carregar as métricas de resultados."
  );
}

export async function getResultsList(
  params: GetResultsListParams = {}
): Promise<PaginatedResponse<ResultItem>> {
  const { page = 1, limit = 6, search } = params;
  return apiRequest<PaginatedResponse<ResultItem>>(
    "/results",
    { params: { page, limit, ...(search ? { search } : {}) } },
    "Erro ao carregar os resultados das avaliações."
  );
}
