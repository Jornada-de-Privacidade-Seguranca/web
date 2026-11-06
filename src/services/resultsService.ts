import { apiRequest } from "@services/httpClient";
import type {
  ResultItem,
  ResultsMetrics,
  PaginatedResponse,
  JourneyDomain,
} from "@features/results/results.types";
import { env } from "@/shared/config/env";

export interface GetResultsListParams {
  page?: number;
  limit?: number;
  search?: string;
  domains?: JourneyDomain[];
}

const MOCK_METRICS: ResultsMetrics = {
  totalCompleted: 12,
  averageScore: 78,
  domainMetrics: [
    {
      domain: "privacy",
      label: "Privacidade",
      averageScore: 84,
    },
    {
      domain: "security",
      label: "Segurança da Informação",
      averageScore: 60,
    },
    {
      domain: "joint",
      label: "Conjunta",
      averageScore: null,
    },
  ],
};

const MOCK_RESULTS: ResultItem[] = [
  {
    id: "1",
    title: "Fundamentos de LGPD",
    score: 88,
    completedAt: "2026-05-15T10:00:00Z",
    domain: "privacy",
    domainLabel: "Privacidade",
  },
  {
    id: "2",
    title: "Segurança da Informação e Senhas",
    score: 68,
    completedAt: "2026-05-18T14:30:00Z",
    domain: "security",
    domainLabel: "Segurança da Informação",
  },
  {
    id: "3",
    title: "Proteção contra Phishing e Engenharia Social",
    score: 52,
    completedAt: "2026-05-20T09:15:00Z",
    domain: "security",
    domainLabel: "Segurança da Informação",
  },
  {
    id: "4",
    title: "Governança de Dados Corporativos",
    score: 95,
    completedAt: "2026-05-22T16:00:00Z",
    domain: "privacy",
    domainLabel: "Privacidade",
  },
  {
    id: "5",
    title: "Gestão de Incidentes de Privacidade",
    score: 74,
    completedAt: "2026-05-25T11:20:00Z",
    domain: "privacy",
    domainLabel: "Privacidade",
  },
  {
    id: "6",
    title: "Conformidade com Marco Civil da Internet",
    score: 81,
    completedAt: "2026-05-28T08:45:00Z",
    domain: "privacy",
    domainLabel: "Privacidade",
  },
  {
    id: "7",
    title: "Auditoria Integrada de TI e Privacidade",
    score: 77,
    completedAt: "2026-06-02T13:10:00Z",
    domain: "joint",
    domainLabel: "Conjunta",
  },
];

export async function getMetrics(): Promise<ResultsMetrics> {
  try {
    const data = await apiRequest<ResultsMetrics>(
      "/results/metrics",
      {},
      "Erro ao carregar as métricas de resultados."
    );
    if (!data.domainMetrics) {
      return {
        ...data,
        domainMetrics: MOCK_METRICS.domainMetrics,
      };
    }
    return data;
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
  const { page = 1, limit = 6, search = "", domains = [] } = params;
  try {
    const queryParams: Record<string, string | number> = { page, limit };
    if (search.trim()) queryParams.search = search.trim();
    if (domains.length > 0) queryParams.domains = domains.join(",");

    return await apiRequest<PaginatedResponse<ResultItem>>(
      "/results",
      { params: queryParams },
      "Não foi possível carregar os resultados das jornadas."
    );
  } catch (err: unknown) {
    if (env.isDev) {
      let filtered = MOCK_RESULTS;

      if (search.trim()) {
        const lowerSearch = search.trim().toLowerCase();
        filtered = filtered.filter((item) =>
          item.title.toLowerCase().includes(lowerSearch)
        );
      }

      if (domains.length > 0) {
        filtered = filtered.filter(
          (item) => item.domain && domains.includes(item.domain)
        );
      }

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
