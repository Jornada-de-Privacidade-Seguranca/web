import { apiRequest } from "@services/httpClient";
import type {
  ResultItem,
  ResultsMetrics,
  PaginatedResponse,
} from "@features/results/results.types";
import { env } from "@/shared/config/env";

export interface GetResultsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

const MOCK_METRICS: ResultsMetrics = {
  totalCompleted: 12,
  averageScore: 78,
};

const MOCK_RESULTS: ResultItem[] = [
  {
    id: "1",
    title: "Fundamentos de LGPD",
    score: 88,
    completedAt: "2026-05-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Segurança da Informação e Senhas",
    score: 68,
    completedAt: "2026-05-18T14:30:00Z",
  },
  {
    id: "3",
    title: "Proteção contra Phishing e Engenharia Social",
    score: 52,
    completedAt: "2026-05-20T09:15:00Z",
  },
  {
    id: "4",
    title: "Governança de Dados Corporativos",
    score: 95,
    completedAt: "2026-05-22T16:00:00Z",
  },
  {
    id: "5",
    title: "Gestão de Incidentes de Privacidade",
    score: 74,
    completedAt: "2026-05-25T11:20:00Z",
  },
  {
    id: "6",
    title: "Conformidade com Marco Civil da Internet",
    score: 81,
    completedAt: "2026-05-28T08:45:00Z",
  },
];

export async function getMetrics(): Promise<ResultsMetrics> {
  try {
    return await apiRequest<ResultsMetrics>(
      "/results/metrics",
      {},
      "Erro ao carregar as métricas de resultados."
    );
  } catch (err: unknown) {
    if (env.isDev) {
      return MOCK_METRICS;
    }
    throw err;
  }
}

export async function getResultsList(
  params: GetResultsListParams = {}
): Promise<PaginatedResponse<ResultItem>> {
  const { page = 1, limit = 6, search = "" } = params;
  try {
    return await apiRequest<PaginatedResponse<ResultItem>>(
      "/results",
      { params: { page, limit, ...(search ? { search } : {}) } },
      "Erro ao carregar os resultados das avaliações."
    );
  } catch (err: unknown) {
    if (env.isDev) {
      const filtered = search
        ? MOCK_RESULTS.filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase())
          )
        : MOCK_RESULTS;

      const startIndex = (page - 1) * limit;
      const paginatedItems = filtered.slice(startIndex, startIndex + limit);
      const totalPages = Math.ceil(filtered.length / limit) || 1;

      return {
        items: paginatedItems,
        total: filtered.length,
        page,
        limit,
        totalPages,
      };
    }
    throw err;
  }
}
