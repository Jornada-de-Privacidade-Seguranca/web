import { apiRequest, apiRequestWithMeta } from "@services/httpClient";
import { getJourneyProfiles } from "@services/journeyProfileService";
import { getInitials } from "@shared/utils/initials";
import { normalizeScore, resolveScoreBand } from "@shared/utils/scoreBand";
import type { PaginationMetaApi } from "@features/assessments/assessments.types";
import type {
  AdminDomainAverage,
  AdminResultDomainMetricApi,
  AdminResultDomainOption,
  AdminResultItem,
  AdminResultItemApi,
  AdminResultMetricsDataApi,
  AdminResultProfileOption,
  AdminResultsCatalogOptions,
  AdminResultsFilterOptions,
  AdminResultsFilterParams,
  AdminResultsPage,
  AdminResultsSummary,
  AdminResultUserOption,
  GetAdminResultsParams,
  JourneyDomain,
  UserWithResultsItemApi,
} from "@features/admin-results/adminResults.types";

/**
 * Ids de TB_DOMINIO_CONHECIMENTO e os domínios usados no front (URL, filtros e tags).
 * 1 = Privacidade, 2 = Segurança da Informação, 3 = Conjunta.
 */
export const DOMAIN_ID_TO_SLUG: Record<number, JourneyDomain> = {
  1: "privacy",
  2: "security",
  3: "joint",
};

export const DOMAIN_SLUG_TO_ID: Record<JourneyDomain, number> = {
  privacy: 1,
  security: 2,
  joint: 3,
};

const DOMAIN_ORDER: Record<JourneyDomain, number> = {
  privacy: 0,
  security: 1,
  joint: 2,
};

/** Maior `per_page` aceito por GET /journey-profiles. */
const JOURNEY_PROFILES_PAGE_SIZE = 100;

export function mapDomainIdToSlug(id: number | null | undefined): JourneyDomain | null {
  if (id == null) return null;
  return DOMAIN_ID_TO_SLUG[id] ?? null;
}

function toIdString(id: number | null | undefined): string {
  return id == null ? "" : String(id);
}

/** A API devolve datas em UTC no formato "Y-m-d H:i:s", sem fuso; a tela formata a partir do ISO. */
function toIsoUtc(dateTime: string | null | undefined): string {
  if (!dateTime) return "";
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(dateTime)) return dateTime;
  return `${dateTime.replace(" ", "T")}Z`;
}

/**
 * Converte os filtros da tela nos parâmetros da API. Busca vazia, ou só com
 * espaços, não vai na requisição.
 */
export function buildAdminResultsFilterParams(
  filters: AdminResultsFilterParams = {}
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  const search = filters.search?.trim();

  if (search) params.search = search;
  if (filters.userId) params.user_id = Number(filters.userId);
  if (filters.department) params.department = filters.department;
  if (filters.domains && filters.domains.length > 0) {
    params["domains[]"] = filters.domains.map((domain) => DOMAIN_SLUG_TO_ID[domain]);
  }
  if (filters.journeyProfileId) params.journey_profile_id = Number(filters.journeyProfileId);
  if (filters.dateFrom) params.ended_from = filters.dateFrom;
  if (filters.dateTo) params.ended_to = filters.dateTo;

  return params;
}

/** Um item de GET /admin/results no formato da tela. */
export function mapAdminResultItem(apiItem: AdminResultItemApi): AdminResultItem {
  const score = normalizeScore(apiItem.score ?? 0);
  const profileNamePt = apiItem.journey_profile?.name_pt ?? "";
  const domainNamePt = apiItem.knowledge_domain?.name_pt ?? "";
  const userName = apiItem.user?.name ?? "";

  return {
    id: String(apiItem.id),
    journeyId: String(apiItem.id),
    user: {
      id: toIdString(apiItem.user?.id),
      name: userName,
      email: apiItem.user?.email ?? "",
      initials: getInitials(userName),
      department: apiItem.user?.department ?? "",
    },
    profileId: toIdString(apiItem.journey_profile?.id),
    profileTitle: profileNamePt,
    profileNamePt,
    profileNameEn: apiItem.journey_profile?.name_en ?? "",
    domain: mapDomainIdToSlug(apiItem.knowledge_domain?.id) ?? "joint",
    domainNamePt,
    domainNameEn: apiItem.knowledge_domain?.name_en ?? "",
    domainLabel: domainNamePt,
    completedAt: toIsoUtc(apiItem.finished_at),
    score,
    scoreBand: resolveScoreBand(score),
  };
}

function mapDomainMetric(metric: AdminResultDomainMetricApi): AdminDomainAverage | null {
  const domain = mapDomainIdToSlug(metric.domain_id);
  if (!domain) return null;

  const namePt = metric.domain_name_pt ?? "";
  return {
    domain,
    namePt,
    nameEn: metric.domain_name_en ?? "",
    label: namePt,
    averageScore: metric.average_score == null ? null : normalizeScore(metric.average_score),
    completedCount: metric.completed_journeys ?? 0,
  };
}

/** Resposta de GET /admin/results/metrics no formato do resumo da tela. */
export function mapAdminResultMetrics(metricsData: AdminResultMetricsDataApi): AdminResultsSummary {
  return {
    totalCompletedJourneys: metricsData.total_completed_journeys ?? 0,
    totalEvaluatedUsers: metricsData.distinct_users_count ?? 0,
    domainAverages: (metricsData.domains ?? [])
      .map(mapDomainMetric)
      .filter((metric): metric is AdminDomainAverage => metric !== null),
  };
}

export function mapUsersWithResults(apiUsers: UserWithResultsItemApi[]): AdminResultUserOption[] {
  return (apiUsers ?? []).map((user) => ({
    id: String(user.id),
    name: user.name ?? "",
    email: user.email ?? "",
  }));
}

/** GET /admin/results: jornadas concluídas de todos os usuários, paginadas. */
export async function getAdminResults(
  params: GetAdminResultsParams = {},
  signal?: AbortSignal
): Promise<AdminResultsPage> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 6;

  const { data, meta } = await apiRequestWithMeta<
    AdminResultItemApi[],
    { pagination?: PaginationMetaApi }
  >(
    "/admin/results",
    { params: { ...buildAdminResultsFilterParams(params), page, per_page: perPage }, signal },
    "Não foi possível carregar os resultados dos usuários."
  );

  const items = (Array.isArray(data) ? data : []).map(mapAdminResultItem);
  const pagination = meta?.pagination;

  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.current_page ?? page,
    limit: pagination?.per_page ?? perPage,
    totalPages: Math.max(1, pagination?.last_page ?? 1),
  };
}

/** GET /admin/results/metrics: resumo com os mesmos filtros da listagem. */
export async function getAdminResultsMetrics(
  filters: AdminResultsFilterParams = {},
  signal?: AbortSignal
): Promise<AdminResultsSummary> {
  const data = await apiRequest<AdminResultMetricsDataApi>(
    "/admin/results/metrics",
    { params: buildAdminResultsFilterParams(filters), signal },
    "Não foi possível carregar o resumo dos resultados."
  );
  return mapAdminResultMetrics(data);
}

/** GET /users/departments: setores existentes, para o filtro de setor. */
export async function getDepartments(signal?: AbortSignal): Promise<string[]> {
  const data = await apiRequest<string[]>(
    "/users/departments",
    { signal },
    "Não foi possível carregar os setores."
  );
  return Array.isArray(data) ? data : [];
}

/** GET /users/with-results: usuários com ao menos uma jornada concluída. */
export async function getUsersWithResults(signal?: AbortSignal): Promise<AdminResultUserOption[]> {
  const data = await apiRequest<UserWithResultsItemApi[]>(
    "/users/with-results",
    { signal },
    "Não foi possível carregar os usuários com resultados."
  );
  return mapUsersWithResults(Array.isArray(data) ? data : []);
}

/**
 * Perfis de jornada e domínios do catálogo (GET /journey-profiles). Os domínios
 * saem dos próprios perfis, já que a API não tem um endpoint só de domínios.
 */
export async function getAdminResultsCatalogOptions(): Promise<AdminResultsCatalogOptions> {
  const first = await getJourneyProfiles(1, JOURNEY_PROFILES_PAGE_SIZE);
  const remainingPages = Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
    getJourneyProfiles(index + 2, JOURNEY_PROFILES_PAGE_SIZE)
  );
  const profiles = [first, ...(await Promise.all(remainingPages))].flatMap((page) => page.items);

  const domains = new Map<JourneyDomain, AdminResultDomainOption>();
  for (const profile of profiles) {
    const knowledgeDomain = profile.knowledge_domain;
    const domain = mapDomainIdToSlug(knowledgeDomain?.id);
    if (knowledgeDomain && domain && !domains.has(domain)) {
      domains.set(domain, {
        id: domain,
        namePt: knowledgeDomain.name_pt ?? "",
        nameEn: knowledgeDomain.name_en ?? "",
        label: knowledgeDomain.name_pt ?? "",
      });
    }
  }

  const journeyProfiles: AdminResultProfileOption[] = profiles
    .map((profile) => ({
      id: String(profile.id),
      namePt: profile.name_pt,
      nameEn: profile.name_en,
      label: profile.name_pt,
    }))
    .sort((a, b) => a.namePt.localeCompare(b.namePt, "pt-BR"));

  return {
    journeyProfiles,
    domains: Array.from(domains.values()).sort((a, b) => DOMAIN_ORDER[a.id] - DOMAIN_ORDER[b.id]),
  };
}

/** Todas as opções dos filtros: usuários, setores, perfis de jornada e domínios. */
export async function getAdminResultsFilterOptions(
  signal?: AbortSignal
): Promise<AdminResultsFilterOptions> {
  const [users, departments, catalog] = await Promise.all([
    getUsersWithResults(signal),
    getDepartments(signal),
    getAdminResultsCatalogOptions(),
  ]);

  return { users, departments, ...catalog };
}
