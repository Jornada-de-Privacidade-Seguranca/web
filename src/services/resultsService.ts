import { apiRequest, ApiRequestError } from "@services/httpClient";
import type {
  ResultItem,
  ResultsMetrics,
  PaginatedResponse,
  JourneyDomain,
} from "@features/results/results.types";
import { env } from "@shared/config/env";

export interface GetResultsListParams {
  userId?: number | string;
  page?: number;
  per_page?: number;
  limit?: number;
  search?: string;
  domains?: (JourneyDomain | number)[];
}

function isNetworkError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === undefined;
}

const MOCK_METRICS: ResultsMetrics = {
  totalCompleted: 6,
  averageScore: 78,
  domainMetrics: [
    {
      domain: "privacy",
      domainId: 1,
      namePt: "Privacidade",
      nameEn: "Privacy",
      label: "Privacidade",
      averageScore: 84,
    },
    {
      domain: "security",
      domainId: 2,
      namePt: "Segurança da Informação",
      nameEn: "Information Security",
      label: "Segurança da Informação",
      averageScore: 60,
    },
    {
      domain: "joint",
      domainId: 3,
      namePt: "Conjunta",
      nameEn: "Joint",
      label: "Conjunta",
      averageScore: null,
    },
  ],
};

const MOCK_RESULTS: ResultItem[] = [
  {
    id: "1",
    title: "Encarregado pelo Tratamento de Dados Pessoais",
    namePt: "Encarregado pelo Tratamento de Dados Pessoais",
    nameEn: "Data Protection Officer (DPO)",
    score: 88,
    completedAt: "2026-05-15T10:00:00Z",
    domain: "privacy",
    domainId: 1,
    domainNamePt: "Privacidade",
    domainNameEn: "Privacy",
    domainLabel: "Privacidade",
  },
  {
    id: "2",
    title: "Gestor de Segurança da Informação",
    namePt: "Gestor de Segurança da Informação",
    nameEn: "Information Security Manager",
    score: 68,
    completedAt: "2026-05-18T14:30:00Z",
    domain: "security",
    domainId: 2,
    domainNamePt: "Segurança da Informação",
    domainNameEn: "Information Security",
    domainLabel: "Segurança da Informação",
  },
  {
    id: "3",
    title: "Membro de Equipe de Resposta a Incidentes",
    namePt: "Membro de Equipe de Resposta a Incidentes",
    nameEn: "Incident Response Team Member",
    score: 52,
    completedAt: "2026-05-20T09:15:00Z",
    domain: "security",
    domainId: 2,
    domainNamePt: "Segurança da Informação",
    domainNameEn: "Information Security",
    domainLabel: "Segurança da Informação",
  },
  {
    id: "4",
    title: "Controlador",
    namePt: "Controlador",
    nameEn: "Data Controller",
    score: 95,
    completedAt: "2026-05-22T16:00:00Z",
    domain: "privacy",
    domainId: 1,
    domainNamePt: "Privacidade",
    domainNameEn: "Privacy",
    domainLabel: "Privacidade",
  },
  {
    id: "5",
    title: "Operador",
    namePt: "Operador",
    nameEn: "Data Processor",
    score: 74,
    completedAt: "2026-05-25T11:20:00Z",
    domain: "privacy",
    domainId: 1,
    domainNamePt: "Privacidade",
    domainNameEn: "Privacy",
    domainLabel: "Privacidade",
  },
  {
    id: "6",
    title: "Auditor de Conformidade e Segurança",
    namePt: "Auditor de Conformidade e Segurança",
    nameEn: "Compliance and Security Auditor",
    score: 77,
    completedAt: "2026-06-02T13:10:00Z",
    domain: "joint",
    domainId: 3,
    domainNamePt: "Conjunta",
    domainNameEn: "Joint",
    domainLabel: "Conjunta",
  },
];

export async function getMetrics(userId: number | string = 1): Promise<ResultsMetrics> {
  const targetId = userId ?? 1;
  try {
    const data = await apiRequest<ResultsMetrics>(
      `/users/${targetId}/journeys/metrics`,
      {},
      "Erro ao carregar as métricas de resultados."
    );
    if (!data.domainMetrics && env.isDev) {
      return {
        ...data,
        domainMetrics: MOCK_METRICS.domainMetrics,
      };
    }
    return {
      ...data,
      domainMetrics: data.domainMetrics ?? [],
    };
  } catch (err: unknown) {
    if (env.isDev && isNetworkError(err)) {
      return MOCK_METRICS;
    }
    throw err;
  }
}

export async function getResultsList(
  params: GetResultsListParams = {}
): Promise<PaginatedResponse<ResultItem>> {
  const targetId = params.userId ?? 1;
  const page = params.page ?? 1;
  const perPage = params.per_page ?? params.limit ?? 6;
  const search = params.search?.trim() ?? "";
  const domains = params.domains ?? [];

  try {
    const queryParams: Record<string, unknown> = {
      page,
      per_page: perPage,
    };
    if (search) queryParams.search = search;
    if (domains.length > 0) {
      queryParams["domains[]"] = domains.map((d) => {
        if (typeof d === "number") return d;
        if (d === "privacy") return 1;
        if (d === "security") return 2;
        if (d === "joint") return 3;
        return d;
      });
    }

    return await apiRequest<PaginatedResponse<ResultItem>>(
      `/users/${targetId}/journeys`,
      { params: queryParams },
      "Não foi possível carregar os resultados das jornadas."
    );
  } catch (err: unknown) {
    if (env.isDev && isNetworkError(err)) {
      let filtered = MOCK_RESULTS;

      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(lowerSearch) ||
            item.namePt?.toLowerCase().includes(lowerSearch) ||
            item.nameEn?.toLowerCase().includes(lowerSearch)
        );
      }

      if (domains.length > 0) {
        filtered = filtered.filter((item) => {
          if (!item.domain && !item.domainId) return false;
          return domains.some((d) => {
            if (typeof d === "number") return item.domainId === d;
            return item.domain === d;
          });
        });
      }

      const startIndex = (page - 1) * perPage;
      const paginatedItems = filtered.slice(startIndex, startIndex + perPage);
      const totalPages = Math.ceil(filtered.length / perPage) || 1;

      return {
        items: paginatedItems,
        total: filtered.length,
        page,
        limit: perPage,
        totalPages,
      };
    }
    throw err;
  }
}
