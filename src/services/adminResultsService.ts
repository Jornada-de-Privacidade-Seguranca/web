import { apiRequest, apiRequestWithMeta, ApiRequestError } from "@services/httpClient";
import { getJourneyProfiles } from "@services/journeyProfileService";
import { getInitials } from "@shared/utils/initials";
import { normalizeScore, resolveScoreBand } from "@shared/utils/scoreBand";
import { env } from "@shared/config/env";
import type {
  AdminDomainAverage,
  AdminResultDomainOption,
  AdminResultItem,
  AdminResultProfileOption,
  AdminResultsFilterOptions,
  AdminResultsPage,
  AdminResultsSummary,
  AdminResultUserOption,
  GetAdminResultsParams,
  JourneyDomain,
} from "@features/admin-results/adminResults.types";

/**
 * Modelos da API conforme a especificação do backend #158 (PR 83).
 */
export interface AdminResultUserApi {
  id: number | null;
  name: string | null;
  email: string | null;
  department: string | null;
}

export interface AdminResultProfileApi {
  id: number | null;
  name_pt: string | null;
  name_en: string | null;
}

export interface AdminResultDomainApi {
  id: number | null;
  name_pt: string | null;
  name_en: string | null;
}

export interface AdminResultItemApi {
  id: number;
  user: AdminResultUserApi;
  journey_profile: AdminResultProfileApi;
  knowledge_domain: AdminResultDomainApi;
  finished_at: string | null;
  score: number | null;
}

export interface PaginationMetaApi {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface AdminResultListResponseApi {
  success: boolean;
  message: string;
  data: AdminResultItemApi[];
  meta: {
    pagination: PaginationMetaApi;
  };
}

export interface AdminResultDomainMetricApi {
  domain_id: number;
  domain_name_pt: string | null;
  domain_name_en: string | null;
  completed_journeys: number;
  average_score: number | null;
}

export interface AdminResultMetricsDataApi {
  total_completed_journeys: number;
  distinct_users_count: number;
  domains: AdminResultDomainMetricApi[];
}

export interface AdminResultMetricsResponseApi {
  success: boolean;
  message: string;
  data: AdminResultMetricsDataApi;
}

export interface UserWithResultsItemApi {
  id: number;
  name: string | null;
  email: string | null;
}

export interface UsersWithResultsResponseApi {
  success: boolean;
  message: string;
  data: UserWithResultsItemApi[];
}

export interface DepartmentsResponseApi {
  success: boolean;
  message: string;
  data: string[];
}

/**
 * Mapeamentos entre os IDs numéricos da TB_DOMINIO_CONHECIMENTO e os slugs do frontend.
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

export function mapDomainIdToSlug(id: number | null | undefined): JourneyDomain {
  if (id && id in DOMAIN_ID_TO_SLUG) {
    return DOMAIN_ID_TO_SLUG[id];
  }
  return "joint";
}

/** Catálogo estático dos domínios conhecidos no frontend. */
export const DOMAIN_OPTIONS_CATALOG: AdminResultDomainOption[] = [
  { id: "privacy", namePt: "Privacidade", nameEn: "Privacy", label: "Privacidade" },
  {
    id: "security",
    namePt: "Segurança da Informação",
    nameEn: "Information Security",
    label: "Segurança da Informação",
  },
  { id: "joint", namePt: "Conjunta", nameEn: "Joint", label: "Conjunta" },
];

/**
 * Mapeia um registro bruto retornado pela API (/admin/results) para o tipo consumido na tela.
 */
export function mapAdminResultItem(apiItem: AdminResultItemApi): AdminResultItem {
  const score = normalizeScore(apiItem.score ?? 0);
  const domain = mapDomainIdToSlug(apiItem.knowledge_domain?.id);
  const domainNamePt = apiItem.knowledge_domain?.name_pt ?? "";
  const domainNameEn = apiItem.knowledge_domain?.name_en ?? "";
  const profileNamePt = apiItem.journey_profile?.name_pt ?? "";
  const profileNameEn = apiItem.journey_profile?.name_en ?? "";

  return {
    id: String(apiItem.id),
    journeyId: String(apiItem.id),
    user: {
      id:
        apiItem.user?.id !== null && apiItem.user?.id !== undefined
          ? String(apiItem.user.id)
          : "",
      name: apiItem.user?.name ?? "",
      email: apiItem.user?.email ?? "",
      initials: getInitials(apiItem.user?.name ?? ""),
      department: apiItem.user?.department ?? "",
    },
    profileId:
      apiItem.journey_profile?.id !== null && apiItem.journey_profile?.id !== undefined
        ? String(apiItem.journey_profile.id)
        : "",
    profileTitle: profileNamePt,
    profileNamePt,
    profileNameEn,
    domain,
    domainNamePt,
    domainNameEn,
    domainLabel: domainNamePt,
    completedAt: apiItem.finished_at ?? "",
    score,
    scoreBand: resolveScoreBand(score),
  };
}

/**
 * Mapeia a resposta de métricas (/admin/results/metrics) para o resumo da tela.
 * Domínios sem jornadas concluídas mantêm `averageScore: null`, exibidos como "—".
 */
export function mapAdminResultMetrics(
  metricsData: AdminResultMetricsDataApi
): AdminResultsSummary {
  const domainAverages: AdminDomainAverage[] = (metricsData.domains ?? []).map((dm) => {
    const domain = mapDomainIdToSlug(dm.domain_id);
    const namePt = dm.domain_name_pt ?? "";
    const nameEn = dm.domain_name_en ?? "";
    return {
      domain,
      namePt,
      nameEn,
      label: namePt,
      averageScore:
        dm.average_score !== null && dm.average_score !== undefined
          ? normalizeScore(dm.average_score)
          : null,
      completedCount: dm.completed_journeys,
    };
  });

  return {
    totalCompletedJourneys: metricsData.total_completed_journeys,
    totalEvaluatedUsers: metricsData.distinct_users_count,
    domainAverages,
  };
}

/**
 * Mapeia os usuários com resultados (/users/with-results) para opções do filtro.
 */
export function mapUsersWithResults(
  apiUsers: UserWithResultsItemApi[]
): AdminResultUserOption[] {
  return (apiUsers ?? []).map((u) => ({
    id: String(u.id),
    name: u.name ?? "",
    email: u.email ?? "",
  }));
}

function isNetworkError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === undefined;
}

function shouldFallbackToMock(error: unknown): boolean {
  return (
    (env.isDev || process.env.NODE_ENV === "test") &&
    isNetworkError(error)
  );
}

/**
 * Mock em conformidade estrita com o formato do backend #158 (PR 83).
 */
export const MOCK_ADMIN_RESULTS_API_DATA: AdminResultItemApi[] = [
  {
    id: 101,
    user: {
      id: 1,
      name: "Ana Beatriz Silva",
      email: "ana.silva@empresa.com",
      department: "Tecnologia da Informação",
    },
    journey_profile: {
      id: 6,
      name_pt: "Auditor de Conformidade e Segurança",
      name_en: "Compliance and Security Auditor",
    },
    knowledge_domain: {
      id: 3,
      name_pt: "Conjunta",
      name_en: "Joint",
    },
    finished_at: "2026-06-08 14:20:00",
    score: 92.0,
  },
  {
    id: 102,
    user: {
      id: 6,
      name: "Lucas Pereira",
      email: "lucas.pereira@empresa.com",
      department: "Tecnologia da Informação",
    },
    journey_profile: {
      id: 6,
      name_pt: "Auditor de Conformidade e Segurança",
      name_en: "Compliance and Security Auditor",
    },
    knowledge_domain: {
      id: 3,
      name_pt: "Conjunta",
      name_en: "Joint",
    },
    finished_at: "2026-06-05 17:30:00",
    score: 84.0,
  },
  {
    id: 103,
    user: {
      id: 9,
      name: "Bruno Almeida",
      email: "bruno.almeida@empresa.com",
      department: "Compliance",
    },
    journey_profile: {
      id: 4,
      name_pt: "Gestor de Segurança da Informação",
      name_en: "Information Security Manager",
    },
    knowledge_domain: {
      id: 2,
      name_pt: "Segurança da Informação",
      name_en: "Information Security",
    },
    finished_at: "2026-06-02 11:45:00",
    score: 91.0,
  },
  {
    id: 104,
    user: {
      id: 7,
      name: "Fernanda Costa",
      email: "fernanda.costa@empresa.com",
      department: "Operações",
    },
    journey_profile: {
      id: 6,
      name_pt: "Auditor de Conformidade e Segurança",
      name_en: "Compliance and Security Auditor",
    },
    knowledge_domain: {
      id: 3,
      name_pt: "Conjunta",
      name_en: "Joint",
    },
    finished_at: "2026-05-29 15:10:00",
    score: 54.0,
  },
  {
    id: 105,
    user: {
      id: 1,
      name: "Ana Beatriz Silva",
      email: "ana.silva@empresa.com",
      department: "Tecnologia da Informação",
    },
    journey_profile: {
      id: 5,
      name_pt: "Membro de Equipe de Resposta a Incidentes",
      name_en: "Incident Response Team Member",
    },
    knowledge_domain: {
      id: 2,
      name_pt: "Segurança da Informação",
      name_en: "Information Security",
    },
    finished_at: "2026-05-25 16:00:00",
    score: 78.0,
  },
  {
    id: 106,
    user: {
      id: 7,
      name: "Fernanda Costa",
      email: "fernanda.costa@empresa.com",
      department: "Operações",
    },
    journey_profile: {
      id: 1,
      name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
      name_en: "Data Protection Officer (DPO)",
    },
    knowledge_domain: {
      id: 1,
      name_pt: "Privacidade",
      name_en: "Privacy",
    },
    finished_at: "2026-05-22 10:30:00",
    score: 66.0,
  },
  {
    id: 107,
    user: {
      id: 3,
      name: "Mariana Oliveira",
      email: "mariana.oliveira@empresa.com",
      department: "Recursos Humanos",
    },
    journey_profile: {
      id: 5,
      name_pt: "Membro de Equipe de Resposta a Incidentes",
      name_en: "Incident Response Team Member",
    },
    knowledge_domain: {
      id: 2,
      name_pt: "Segurança da Informação",
      name_en: "Information Security",
    },
    finished_at: "2026-05-19 09:00:00",
    score: 58.0,
  },
  {
    id: 108,
    user: {
      id: 6,
      name: "Lucas Pereira",
      email: "lucas.pereira@empresa.com",
      department: "Tecnologia da Informação",
    },
    journey_profile: {
      id: 5,
      name_pt: "Membro de Equipe de Resposta a Incidentes",
      name_en: "Incident Response Team Member",
    },
    knowledge_domain: {
      id: 2,
      name_pt: "Segurança da Informação",
      name_en: "Information Security",
    },
    finished_at: "2026-05-14 14:10:00",
    score: 79.0,
  },
  {
    id: 109,
    user: {
      id: 2,
      name: "Carlos Eduardo Santos",
      email: "carlos.santos@empresa.com",
      department: "Jurídico",
    },
    journey_profile: {
      id: 2,
      name_pt: "Controlador",
      name_en: "Data Controller",
    },
    knowledge_domain: {
      id: 1,
      name_pt: "Privacidade",
      name_en: "Privacy",
    },
    finished_at: "2026-05-10 15:45:00",
    score: 88.0,
  },
  {
    id: 110,
    user: {
      id: 3,
      name: "Mariana Oliveira",
      email: "mariana.oliveira@empresa.com",
      department: "Recursos Humanos",
    },
    journey_profile: {
      id: 1,
      name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
      name_en: "Data Protection Officer (DPO)",
    },
    knowledge_domain: {
      id: 1,
      name_pt: "Privacidade",
      name_en: "Privacy",
    },
    finished_at: "2026-05-02 16:20:00",
    score: 72.0,
  },
  {
    id: 111,
    user: {
      id: 6,
      name: "Lucas Pereira",
      email: "lucas.pereira@empresa.com",
      department: "Tecnologia da Informação",
    },
    journey_profile: {
      id: 4,
      name_pt: "Gestor de Segurança da Informação",
      name_en: "Information Security Manager",
    },
    knowledge_domain: {
      id: 2,
      name_pt: "Segurança da Informação",
      name_en: "Information Security",
    },
    finished_at: "2026-04-25 11:00:00",
    score: 82.0,
  },
  {
    id: 112,
    user: {
      id: 2,
      name: "Carlos Eduardo Santos",
      email: "carlos.santos@empresa.com",
      department: "Jurídico",
    },
    journey_profile: {
      id: 1,
      name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
      name_en: "Data Protection Officer (DPO)",
    },
    knowledge_domain: {
      id: 1,
      name_pt: "Privacidade",
      name_en: "Privacy",
    },
    finished_at: "2026-04-20 10:00:00",
    score: 95.0,
  },
  {
    id: 113,
    user: {
      id: 1,
      name: "Ana Beatriz Silva",
      email: "ana.silva@empresa.com",
      department: "Tecnologia da Informação",
    },
    journey_profile: {
      id: 4,
      name_pt: "Gestor de Segurança da Informação",
      name_en: "Information Security Manager",
    },
    knowledge_domain: {
      id: 2,
      name_pt: "Segurança da Informação",
      name_en: "Information Security",
    },
    finished_at: "2026-04-05 09:15:00",
    score: 85.0,
  },
  {
    id: 114,
    user: {
      id: 1,
      name: "Ana Beatriz Silva",
      email: "ana.silva@empresa.com",
      department: "Tecnologia da Informação",
    },
    journey_profile: {
      id: 1,
      name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
      name_en: "Data Protection Officer (DPO)",
    },
    knowledge_domain: {
      id: 1,
      name_pt: "Privacidade",
      name_en: "Privacy",
    },
    finished_at: "2026-03-12 14:30:00",
    score: 90.0,
  },
];

export const MOCK_DEPARTMENTS_DATA: string[] = [
  "Compliance",
  "Jurídico",
  "Operações",
  "Recursos Humanos",
  "Tecnologia da Informação",
];

export const MOCK_USERS_WITH_RESULTS_DATA: UserWithResultsItemApi[] = [
  { id: 1, name: "Ana Beatriz Silva", email: "ana.silva@empresa.com" },
  { id: 2, name: "Carlos Eduardo Santos", email: "carlos.santos@empresa.com" },
  { id: 3, name: "Mariana Oliveira", email: "mariana.oliveira@empresa.com" },
  { id: 6, name: "Lucas Pereira", email: "lucas.pereira@empresa.com" },
  { id: 7, name: "Fernanda Costa", email: "fernanda.costa@empresa.com" },
  { id: 9, name: "Bruno Almeida", email: "bruno.almeida@empresa.com" },
];

/**
 * Filtra a base mock aplicando as mesmas regras de filtro da API backend (#158).
 */
function filterMockAdminResults(params: GetAdminResultsParams = {}): AdminResultItemApi[] {
  const {
    search = "",
    userId = "",
    department = "",
    domains = [],
    journeyProfileId = "",
    dateFrom = "",
    dateTo = "",
  } = params;

  let filtered = [...MOCK_ADMIN_RESULTS_API_DATA];

  const normalizedSearch = search.trim().toLowerCase();
  if (normalizedSearch) {
    filtered = filtered.filter((item) => {
      const name = item.user.name?.toLowerCase() ?? "";
      const email = item.user.email?.toLowerCase() ?? "";
      const profilePt = item.journey_profile.name_pt?.toLowerCase() ?? "";
      const profileEn = item.journey_profile.name_en?.toLowerCase() ?? "";
      return (
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        profilePt.includes(normalizedSearch) ||
        profileEn.includes(normalizedSearch)
      );
    });
  }

  if (userId) {
    const numericUserId = Number(userId);
    filtered = filtered.filter((item) => item.user.id === numericUserId);
  }

  if (department) {
    filtered = filtered.filter((item) => item.user.department === department);
  }

  if (domains.length > 0) {
    const selectedDomainIds = new Set(
      domains.map((d) => (typeof d === "number" ? d : DOMAIN_SLUG_TO_ID[d]))
    );
    filtered = filtered.filter(
      (item) => item.knowledge_domain.id !== null && selectedDomainIds.has(item.knowledge_domain.id)
    );
  }

  if (journeyProfileId) {
    const numericProfileId = Number(journeyProfileId);
    filtered = filtered.filter((item) => item.journey_profile.id === numericProfileId);
  }

  if (dateFrom) {
    filtered = filtered.filter(
      (item) => (item.finished_at ?? "").slice(0, 10) >= dateFrom
    );
  }

  if (dateTo) {
    filtered = filtered.filter(
      (item) => (item.finished_at ?? "").slice(0, 10) <= dateTo
    );
  }

  return filtered;
}

/**
 * 1. GET /admin/results
 * Retorna lista paginada de jornadas concluídas de todos os usuários com filtros combinados.
 */
export async function getAdminResults(
  params: GetAdminResultsParams = {}
): Promise<AdminResultsPage> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 6;

  try {
    const queryParams: Record<string, unknown> = {
      page,
      per_page: perPage,
    };
    if (params.search?.trim()) queryParams.search = params.search.trim();
    if (params.userId) queryParams.user_id = Number(params.userId);
    if (params.department) queryParams.department = params.department;
    if (params.domains && params.domains.length > 0) {
      queryParams["domains[]"] = params.domains.map((d) =>
        typeof d === "number" ? d : DOMAIN_SLUG_TO_ID[d]
      );
    }
    if (params.journeyProfileId) {
      queryParams.journey_profile_id = Number(params.journeyProfileId);
    }
    if (params.dateFrom) queryParams.ended_from = params.dateFrom;
    if (params.dateTo) queryParams.ended_to = params.dateTo;

    const { data, meta } = await apiRequestWithMeta<
      AdminResultItemApi[],
      { pagination?: PaginationMetaApi }
    >(
      "/admin/results",
      { params: queryParams },
      "Não foi possível carregar os resultados dos usuários."
    );

    const items = (Array.isArray(data) ? data : []).map(mapAdminResultItem);
    const pagination = meta?.pagination;

    return {
      items,
      total: pagination?.total ?? items.length,
      filteredTotal: pagination?.total ?? items.length,
      page: pagination?.current_page ?? page,
      limit: pagination?.per_page ?? perPage,
      totalPages: pagination?.total_pages ?? 1,
    };
  } catch (err: unknown) {
    if (shouldFallbackToMock(err)) {
      const filtered = filterMockAdminResults(params);
      const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const startIndex = (safePage - 1) * perPage;
      const paginatedItems = filtered.slice(startIndex, startIndex + perPage);

      return {
        items: paginatedItems.map(mapAdminResultItem),
        total: MOCK_ADMIN_RESULTS_API_DATA.length,
        filteredTotal: filtered.length,
        page: safePage,
        limit: perPage,
        totalPages,
      };
    }
    throw err;
  }
}

/**
 * 2. GET /admin/results/metrics
 * Retorna métricas agregadas por domínio aplicando os mesmos filtros de listagem.
 */
export async function getAdminResultsMetrics(
  params: GetAdminResultsParams = {}
): Promise<AdminResultsSummary> {
  try {
    const queryParams: Record<string, unknown> = {};
    if (params.search?.trim()) queryParams.search = params.search.trim();
    if (params.userId) queryParams.user_id = Number(params.userId);
    if (params.department) queryParams.department = params.department;
    if (params.domains && params.domains.length > 0) {
      queryParams["domains[]"] = params.domains.map((d) =>
        typeof d === "number" ? d : DOMAIN_SLUG_TO_ID[d]
      );
    }
    if (params.journeyProfileId) {
      queryParams.journey_profile_id = Number(params.journeyProfileId);
    }
    if (params.dateFrom) queryParams.ended_from = params.dateFrom;
    if (params.dateTo) queryParams.ended_to = params.dateTo;

    const metricsData = await apiRequest<AdminResultMetricsDataApi>(
      "/admin/results/metrics",
      { params: queryParams },
      "Não foi possível carregar as métricas dos resultados."
    );

    return mapAdminResultMetrics(metricsData);
  } catch (err: unknown) {
    if (shouldFallbackToMock(err)) {
      const filtered = filterMockAdminResults(params);
      const distinctUsers = new Set(filtered.map((item) => item.user.id));

      const domainsMetrics: AdminResultDomainMetricApi[] = [
        { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
        { id: 2, name_pt: "Segurança da Informação", name_en: "Information Security" },
        { id: 3, name_pt: "Conjunta", name_en: "Joint" },
      ].map((d) => {
        const domainItems = filtered.filter((item) => item.knowledge_domain.id === d.id);
        const count = domainItems.length;
        const sum = domainItems.reduce((acc, item) => acc + (item.score ?? 0), 0);
        return {
          domain_id: d.id,
          domain_name_pt: d.name_pt,
          domain_name_en: d.name_en,
          completed_journeys: count,
          average_score: count > 0 ? sum / count : null,
        };
      });

      const mockData: AdminResultMetricsDataApi = {
        total_completed_journeys: filtered.length,
        distinct_users_count: distinctUsers.size,
        domains: domainsMetrics,
      };

      return mapAdminResultMetrics(mockData);
    }
    throw err;
  }
}

/**
 * 3. GET /users/departments
 * Retorna a lista de setores distintos cadastrados.
 */
export async function getDepartments(): Promise<string[]> {
  try {
    const data = await apiRequest<string[]>(
      "/users/departments",
      {},
      "Não foi possível carregar os setores."
    );
    return Array.isArray(data) ? data : [];
  } catch (err: unknown) {
    if (shouldFallbackToMock(err)) {
      return [...MOCK_DEPARTMENTS_DATA];
    }
    throw err;
  }
}

/**
 * 4. GET /users/with-results
 * Retorna os usuários que concluíram ao menos uma jornada.
 */
export async function getUsersWithResults(): Promise<AdminResultUserOption[]> {
  try {
    const data = await apiRequest<UserWithResultsItemApi[]>(
      "/users/with-results",
      {},
      "Não foi possível carregar os usuários avaliados."
    );
    return mapUsersWithResults(data);
  } catch (err: unknown) {
    if (shouldFallbackToMock(err)) {
      return mapUsersWithResults(MOCK_USERS_WITH_RESULTS_DATA);
    }
    throw err;
  }
}

/**
 * Carrega os perfis de jornada para o filtro via GET /journey-profiles existente.
 */
export async function getJourneyProfileFilterOptions(): Promise<AdminResultProfileOption[]> {
  try {
    const page = await getJourneyProfiles(1, 100);
    return (page.items ?? []).map((p) => ({
      id: String(p.id),
      namePt: p.name_pt,
      nameEn: p.name_en,
      label: p.name_pt,
    }));
  } catch (err: unknown) {
    if (shouldFallbackToMock(err)) {
      const profilesMap = new Map<number, AdminResultProfileOption>();
      for (const item of MOCK_ADMIN_RESULTS_API_DATA) {
        if (item.journey_profile.id !== null && !profilesMap.has(item.journey_profile.id)) {
          profilesMap.set(item.journey_profile.id, {
            id: String(item.journey_profile.id),
            namePt: item.journey_profile.name_pt ?? "",
            nameEn: item.journey_profile.name_en ?? "",
            label: item.journey_profile.name_pt ?? "",
          });
        }
      }
      return Array.from(profilesMap.values()).sort((a, b) =>
        a.namePt.localeCompare(b.namePt, "pt-BR")
      );
    }
    throw err;
  }
}

/**
 * Agrega todas as opções necessárias para os filtros da tela de resultados do admin.
 */
export async function getAdminResultsFilterOptions(): Promise<AdminResultsFilterOptions> {
  const [users, departments, journeyProfiles] = await Promise.all([
    getUsersWithResults(),
    getDepartments(),
    getJourneyProfileFilterOptions(),
  ]);

  return {
    users,
    departments,
    domains: DOMAIN_OPTIONS_CATALOG,
    journeyProfiles,
  };
}
