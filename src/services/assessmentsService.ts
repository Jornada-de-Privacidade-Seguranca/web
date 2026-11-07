import { apiRequestWithMeta, ApiRequestError } from "@services/httpClient";
import {
  getJourneyProfiles,
  type JourneyProfileApi,
} from "@services/journeyProfileService";
import { getProfileSummaryUrl, getCompetenciesAreaUrl } from "@shared/utils/journeyRoutes";
import { env } from "@shared/config/env";
import type {
  Journey,
  JourneyDomain,
  JourneyStatus,
  PaginatedResponse,
  ProfileMetadata,
  UserJourneyApiStatus,
  UserJourneyListItemApi,
  UserJourneyListMetaApi,
} from "@features/assessments/assessments.types";

export interface GetPendingAssessmentsParams {
  userId: number;
  page?: number;
  perPage?: number;
}

export interface GetCatalogAssessmentsParams {
  page?: number;
  limit?: number;
  locale?: "pt" | "en";
}

const USER_JOURNEY_STATUS_MAP: Record<UserJourneyApiStatus, JourneyStatus> = {
  ongoing: "in_progress",
  completed: "completed",
};

const DOMAIN_BY_TYPE_MAP: Record<number, JourneyDomain> = {
  1: "privacy",
  2: "security",
  3: "joint",
};

export const PROFILE_METADATA_MOCK: Record<number, ProfileMetadata> = {
  1: { competenciesCount: 14, estimatedMinutes: 25, status: "completed", score: 88 },
  2: { competenciesCount: 16, estimatedMinutes: 30, status: "completed", score: 92 },
  3: { competenciesCount: 10, estimatedMinutes: 20, status: "in_progress" },
  4: { competenciesCount: 8, estimatedMinutes: 15, status: "not_started" },
  5: { competenciesCount: 12, estimatedMinutes: 25, status: "completed", score: 76 },
  6: { competenciesCount: 15, estimatedMinutes: 30, status: "not_started" },
};

export const MOCK_CATALOG_PROFILES: JourneyProfileApi[] = [
  {
    id: 1,
    name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
    name_en: "Data Protection Officer (DPO)",
    description_pt: "Atuação como canal de comunicação entre controlador, titulares e ANPD.",
    description_en: "Acts as a communication channel between controller, data subjects, and DPA.",
    type: 1,
    user_status: "completed",
    last_score: 88,
    competencies_count: 14,
    estimated_minutes: 25,
  },
  {
    id: 2,
    name_pt: "Gestor de Segurança da Informação",
    name_en: "Information Security Manager",
    description_pt: "Gestão estratégica de controles de segurança e respostas a incidentes.",
    description_en: "Strategic management of security controls and incident response.",
    type: 2,
    user_status: "completed",
    last_score: 92,
    competencies_count: 16,
    estimated_minutes: 30,
  },
  {
    id: 3,
    name_pt: "Controlador",
    name_en: "Data Controller",
    description_pt: "Competências sobre decisões referentes ao tratamento de dados pessoais.",
    description_en: "Competencies on decisions regarding personal data processing.",
    type: 1,
    user_status: "in_progress",
    competencies_count: 10,
    estimated_minutes: 20,
  },
  {
    id: 4,
    name_pt: "Operador",
    name_en: "Data Operator",
    description_pt: "Realização do tratamento de dados pessoais em nome do controlador.",
    description_en: "Carrying out personal data processing on behalf of the controller.",
    type: 1,
    user_status: "not_started",
    competencies_count: 8,
    estimated_minutes: 15,
  },
  {
    id: 5,
    name_pt: "Equipe de Apoio ao Encarregado",
    name_en: "DPO Support Team",
    description_pt: "Apoio operacional e técnico nas atividades do encarregado pelo tratamento de dados.",
    description_en: "Operational and technical support for DPO activities.",
    type: 3,
    user_status: "completed",
    last_score: 76,
    competencies_count: 12,
    estimated_minutes: 25,
  },
  {
    id: 6,
    name_pt: "Agente Responsável pela Gestão de Riscos de Segurança da Informação",
    name_en: "Information Security Risk Management Agent",
    description_pt: "Identificação, avaliação e mitigação de riscos de segurança da informação.",
    description_en: "Identification, assessment and mitigation of information security risks.",
    type: 2,
    user_status: "not_started",
    competencies_count: 15,
    estimated_minutes: 30,
  },
];

function mapUserJourneyToJourney(item: UserJourneyListItemApi): Journey {
  const profile = item.journey_profile;
  const title = profile?.name || profile?.description || "";
  const description = profile?.name ? (profile?.description ?? "") : "";
  const domainId = profile?.knowledge_domain?.id;
  const domain = domainId ? DOMAIN_BY_TYPE_MAP[domainId] : undefined;

  return {
    id: String(item.id),
    title,
    description,
    domain: domain ?? "privacy",
    status: USER_JOURNEY_STATUS_MAP[item.status] ?? "in_progress",
    href: getCompetenciesAreaUrl(0),
    competenciesCount: item.summary?.acquired_knowledges_count ?? undefined,
    origin: "self_started",
    isSelfStarted: true,
  };
}

export async function getPendingAssessments({
  userId,
  page = 1,
  perPage = 6,
}: GetPendingAssessmentsParams): Promise<PaginatedResponse<Journey>> {
  if (!userId) {
    return {
      items: [],
      total: 0,
      page,
      limit: perPage,
      totalPages: 1,
    };
  }

  const { data, meta } = await apiRequestWithMeta<
    UserJourneyListItemApi[],
    UserJourneyListMetaApi
  >(
    `/users/${userId}/journeys`,
    { params: { status: "ongoing", page, per_page: perPage } },
    "Erro ao carregar jornadas pendentes."
  );

  const items = Array.isArray(data) ? data.map(mapUserJourneyToJourney) : [];
  const pagination = meta?.pagination;

  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.current_page ?? page,
    limit: pagination?.per_page ?? perPage,
    totalPages: pagination?.last_page ?? 1,
  };
}

export function mapProfileToJourney(
  profile: JourneyProfileApi,
  locale: "pt" | "en"
): Journey {
  const isEnglish = locale === "en";
  const id = String(profile.id);
  const domain = profile.type ? DOMAIN_BY_TYPE_MAP[profile.type] : undefined;

  const status: JourneyStatus =
    profile.user_status === "completed" ||
    profile.user_status === "in_progress" ||
    profile.user_status === "not_started"
      ? (profile.user_status as JourneyStatus)
      : "not_started";

  const score =
    typeof profile.last_score === "number"
      ? profile.last_score
      : undefined;

  const competenciesCount =
    typeof profile.competencies_count === "number"
      ? profile.competencies_count
      : undefined;

  const estimatedMinutes =
    typeof profile.estimated_minutes === "number"
      ? profile.estimated_minutes
      : undefined;

  return {
    id,
    title: (isEnglish ? profile.name_en : profile.name_pt) || profile.name_pt,
    description: (isEnglish ? profile.description_en : profile.description_pt) ?? "",
    domain: domain ?? "privacy",
    competenciesCount,
    estimatedMinutes,
    status,
    score,
    href: getProfileSummaryUrl(id),
  };
}

/**
 * Catálogo de jornadas: perfis paginados no backend ou mockados no formato da #147.
 * O padrão para exibição nesta issue é de 9 por página.
 */
export async function getCatalogAssessments({
  page = 1,
  limit = 9,
  locale = "pt",
}: GetCatalogAssessmentsParams = {}): Promise<PaginatedResponse<Journey>> {
  try {
    const profilePage = await getJourneyProfiles(page, limit);
    const items = profilePage.items.map((profile) =>
      mapProfileToJourney(profile, locale)
    );

    return {
      items,
      total: profilePage.total,
      page: profilePage.page,
      limit: profilePage.perPage,
      totalPages: profilePage.totalPages,
    };
  } catch (err: unknown) {
    const isNetworkError =
      err instanceof ApiRequestError && err.status === undefined;
    if (env.isDev && isNetworkError) {
      const items = MOCK_CATALOG_PROFILES.slice((page - 1) * limit, page * limit).map(
        (profile) => mapProfileToJourney(profile, locale)
      );
      return {
        items,
        total: MOCK_CATALOG_PROFILES.length,
        page,
        limit,
        totalPages: Math.ceil(MOCK_CATALOG_PROFILES.length / limit),
      };
    }
    throw err;
  }
}
