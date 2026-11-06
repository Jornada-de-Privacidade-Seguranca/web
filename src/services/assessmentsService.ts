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

/**
 * Metadados estendidos por perfil conforme o protótipo da tarefa #147,
 * enquanto os campos competencies_count, user_status e last_score não
 * forem providos diretamente pela API na issue #98.
 */
export interface ProfileMetadata {
  competenciesCount: number;
  estimatedMinutes: number;
  status: JourneyStatus;
  score?: number;
}

export const PROFILE_METADATA_MOCK: Record<number, ProfileMetadata> = {
  1: { competenciesCount: 14, estimatedMinutes: 25, status: "completed", score: 88 },
  2: { competenciesCount: 16, estimatedMinutes: 30, status: "completed", score: 92 },
  3: { competenciesCount: 10, estimatedMinutes: 20, status: "in_progress" },
  4: { competenciesCount: 8, estimatedMinutes: 15, status: "not_started" },
  5: { competenciesCount: 12, estimatedMinutes: 25, status: "completed", score: 76 },
  6: { competenciesCount: 15, estimatedMinutes: 30, status: "not_started" },
  7: { competenciesCount: 11, estimatedMinutes: 20, status: "not_started" },
  8: { competenciesCount: 13, estimatedMinutes: 25, status: "completed", score: 82 },
  9: { competenciesCount: 18, estimatedMinutes: 35, status: "not_started" },
};

export const MOCK_CATALOG_PROFILES: JourneyProfileApi[] = [
  {
    id: 1,
    name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
    name_en: "Data Protection Officer (DPO)",
    description_pt: "Atuação como canal de comunicação entre controlador, titulares e ANPD.",
    description_en: "Acts as a communication channel between controller, data subjects, and DPA.",
    type: 1,
  },
  {
    id: 2,
    name_pt: "Gestor de Segurança da Informação",
    name_en: "Information Security Manager",
    description_pt: "Gestão estratégica de controles de segurança e respostas a incidentes.",
    description_en: "Strategic management of security controls and incident response.",
    type: 2,
  },
  {
    id: 3,
    name_pt: "Controlador de Dados",
    name_en: "Data Controller",
    description_pt: "Competências sobre decisões referentes ao tratamento de dados pessoais.",
    description_en: "Competencies on decisions regarding personal data processing.",
    type: 1,
  },
  {
    id: 4,
    name_pt: "Operador de Dados",
    name_en: "Data Operator",
    description_pt: "Realização do tratamento de dados pessoais em nome do controlador.",
    description_en: "Carrying out personal data processing on behalf of the controller.",
    type: 1,
  },
  {
    id: 5,
    name_pt: "Auditor de Conformidade e Privacidade",
    name_en: "Compliance and Privacy Auditor",
    description_pt: "Avaliação contínua de processos e aderência às normas de segurança.",
    description_en: "Continuous assessment of processes and adherence to security standards.",
    type: 3,
  },
  {
    id: 6,
    name_pt: "Analista de Segurança da Informação",
    name_en: "Information Security Analyst",
    description_pt: "Operação e monitoramento de controles cibernéticos e vulnerabilidades.",
    description_en: "Operation and monitoring of cyber controls and vulnerabilities.",
    type: 2,
  },
];

function getProfileMetadata(profileId: number, rawProfile?: unknown): ProfileMetadata {
  const raw = rawProfile as Record<string, unknown> | undefined;
  const mock = PROFILE_METADATA_MOCK[profileId] ?? {
    competenciesCount: 6 + ((profileId * 3) % 11),
    estimatedMinutes: 10 + ((profileId * 5) % 25),
    status: profileId % 3 === 0 ? "completed" : "not_started",
    score: profileId % 3 === 0 ? 75 + (profileId % 20) : undefined,
  };

  return {
    competenciesCount:
      typeof raw?.competencies_count === "number"
        ? raw.competencies_count
        : mock.competenciesCount,
    estimatedMinutes:
      typeof raw?.estimated_minutes === "number"
        ? raw.estimated_minutes
        : mock.estimatedMinutes,
    status:
      typeof raw?.user_status === "string"
        ? (raw.user_status as JourneyStatus)
        : mock.status,
    score:
      typeof raw?.last_score === "number"
        ? raw.last_score
        : mock.score,
  };
}

function mapUserJourneyToJourney(item: UserJourneyListItemApi): Journey {
  const profile = item.journey_profile;
  const title = profile?.name || profile?.description || "";
  const description = profile?.name ? (profile?.description ?? "") : "";
  const domainId = profile?.knowledge_domain?.id;
  const domain = domainId ? DOMAIN_BY_TYPE_MAP[domainId] : undefined;

  const profileId = profile?.id ?? 1;
  const meta = getProfileMetadata(profileId, item.summary);

  return {
    id: String(item.id),
    title,
    description,
    domain: domain ?? "privacy",
    status: USER_JOURNEY_STATUS_MAP[item.status] ?? "in_progress",
    href: getCompetenciesAreaUrl(0),
    competenciesCount: item.summary?.acquired_knowledges_count || meta.competenciesCount,
    estimatedMinutes: meta.estimatedMinutes,
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
  const meta = getProfileMetadata(profile.id, profile);

  return {
    id,
    title: (isEnglish ? profile.name_en : profile.name_pt) || profile.name_pt,
    description: (isEnglish ? profile.description_en : profile.description_pt) ?? "",
    domain: domain ?? "privacy",
    competenciesCount: meta.competenciesCount,
    estimatedMinutes: meta.estimatedMinutes,
    status: meta.status,
    score: meta.score,
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
