import { apiRequest, apiRequestWithMeta } from "@services/httpClient";
import { mapKnowledgeDomainId } from "@services/journeyService";
import type {
  DomainMetric,
  DomainMetricApi,
  JourneyDomain,
  PaginatedResponse,
  ResultItem,
  ResultJourneyApi,
  ResultsListMetaApi,
  ResultsMetrics,
  ResultsMetricsApi,
} from "@features/results/results.types";

export interface GetResultsListParams {
  userId: number | string;
  page?: number;
  per_page?: number;
  search?: string;
  domains?: JourneyDomain[];
}

/** Id do domínio de conhecimento no backend para cada domínio da jornada. */
const DOMAIN_ID_BY_DOMAIN: Record<JourneyDomain, number> = {
  privacy: 1,
  security: 2,
  joint: 3,
};

/**
 * O backend devolve as datas como "Y-m-d H:i:s" em UTC, sem fuso. Sem o "Z",
 * o navegador leria como horário local e a data poderia mudar de dia.
 */
function toIsoUtc(dateTime: string | null): string {
  if (!dateTime) return "";
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(dateTime)) return dateTime;
  return `${dateTime.replace(" ", "T")}Z`;
}

function mapDomainMetric(metric: DomainMetricApi): DomainMetric {
  return {
    domain: mapKnowledgeDomainId(metric.domain_id) ?? String(metric.domain_id),
    domainId: metric.domain_id,
    namePt: metric.domain_name_pt ?? undefined,
    nameEn: metric.domain_name_en ?? undefined,
    averageScore: metric.average_score,
  };
}

export function mapResultsMetrics(data: ResultsMetricsApi): ResultsMetrics {
  return {
    totalCompleted: data.summary?.completed_journeys ?? 0,
    averageScore: data.summary?.average_score ?? null,
    domainMetrics: (data.domains ?? []).map(mapDomainMetric),
  };
}

export function mapResultItem(journey: ResultJourneyApi): ResultItem {
  const profile = journey.journey_profile;
  const domainId = profile?.knowledge_domain?.id ?? undefined;

  return {
    id: String(journey.id),
    // A ViewModel escolhe o nome pelo idioma da tela; o título é a alternativa em português
    title: profile?.name_pt ?? "",
    namePt: profile?.name_pt ?? undefined,
    nameEn: profile?.name_en ?? undefined,
    score: Math.round(journey.score ?? 0),
    completedAt: toIsoUtc(journey.finished_at),
    domain: mapKnowledgeDomainId(domainId) ?? undefined,
    domainId,
    domainNamePt: profile?.knowledge_domain?.name_pt ?? undefined,
    domainNameEn: profile?.knowledge_domain?.name_en ?? undefined,
  };
}

export async function getMetrics(userId: number | string): Promise<ResultsMetrics> {
  const data = await apiRequest<ResultsMetricsApi>(
    `/users/${userId}/journeys/metrics`,
    {},
    "Não foi possível carregar o resumo dos resultados."
  );
  return mapResultsMetrics(data);
}

export async function getResultsList(
  params: GetResultsListParams
): Promise<PaginatedResponse<ResultItem>> {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 6;
  const search = params.search?.trim() ?? "";
  const domains = params.domains ?? [];

  const queryParams: Record<string, unknown> = {
    status: "completed",
    page,
    per_page: perPage,
  };
  if (search) queryParams.search = search;
  if (domains.length > 0) {
    queryParams["domains[]"] = domains.map((domain) => DOMAIN_ID_BY_DOMAIN[domain]);
  }

  const { data, meta } = await apiRequestWithMeta<ResultJourneyApi[], ResultsListMetaApi>(
    `/users/${params.userId}/journeys`,
    { params: queryParams },
    "Não foi possível carregar os resultados das jornadas."
  );

  const items = Array.isArray(data) ? data.map(mapResultItem) : [];
  const pagination = meta?.pagination;

  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.current_page ?? page,
    limit: pagination?.per_page ?? perPage,
    totalPages: Math.max(pagination?.last_page ?? 1, 1),
  };
}
