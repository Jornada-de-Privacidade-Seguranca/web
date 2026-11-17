import { apiRequestWithMeta } from "@services/httpClient";
import {
  getJourneyProfile,
  getJourneyProfiles,
  type JourneyProfileApi,
  type JourneyProfileUserStatusApi,
} from "@services/journeyProfileService";
import { estimateJourneyMinutes } from "@services/journeySummaryService";
import { getProfileSummaryUrl, getCompetenciesAreaUrl } from "@shared/utils/journeyRoutes";
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
  locale?: "pt" | "en";
}

export interface GetCatalogAssessmentsParams {
  page?: number;
  limit?: number;
  locale?: "pt" | "en";
  search?: string;
  domains?: JourneyDomain[];
  statuses?: JourneyStatus[];
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

/** Situação do perfil na API (`user_status`) para a situação usada na tela. */
const STATUS_BY_USER_STATUS: Record<JourneyProfileUserStatusApi, JourneyStatus> = {
  completed: "completed",
  pending: "in_progress",
  not_done: "not_started",
};

/** Caminho inverso, para o filtro de situação enviado à API. */
const USER_STATUS_BY_STATUS: Record<JourneyStatus, JourneyProfileUserStatusApi> = {
  completed: "completed",
  in_progress: "pending",
  not_started: "not_done",
};

const DOMAIN_ID_BY_DOMAIN: Record<JourneyDomain, number> = {
  privacy: 1,
  security: 2,
  joint: 3,
};

function mapUserJourneyToJourney(
  item: UserJourneyListItemApi,
  locale: "pt" | "en"
): Journey {
  const profile = item.journey_profile;
  const isEnglish = locale === "en";
  // Em inglês, usa o português quando falta a tradução
  const name = (isEnglish && profile?.name_en) || profile?.name_pt || "";
  const profileDescription =
    (isEnglish && profile?.description_en) || profile?.description_pt || "";
  const title = name || profileDescription;
  const description = name ? profileDescription : "";
  const domainId = profile?.knowledge_domain?.id;
  const domain = domainId ? DOMAIN_BY_TYPE_MAP[domainId] : undefined;

  return {
    id: String(item.id),
    title,
    description,
    domain: domain ?? "privacy",
    status: USER_JOURNEY_STATUS_MAP[item.status] ?? "in_progress",
    href: getCompetenciesAreaUrl(0),
    // O resumo traz só quantas competências já foram respondidas, não o total
    // do perfil; a quantidade fica oculta até a API fornecê-la (#98)
    origin: "self_started",
    isSelfStarted: true,
  };
}

/**
 * Completa a jornada pendente com a quantidade de competências do perfil e o
 * tempo estimado, que a listagem de jornadas do usuário não traz. Uma falha só
 * deixa as duas informações ocultas.
 */
async function withProfileCompetencies(
  journey: Journey,
  profileId: number | null | undefined
): Promise<Journey> {
  if (profileId == null) return journey;
  try {
    const profile = await getJourneyProfile(String(profileId));
    const count = profile.competencies_count;
    if (typeof count !== "number" || count <= 0) return journey;
    return {
      ...journey,
      competenciesCount: count,
      estimatedMinutes: estimateJourneyMinutes(count),
    };
  } catch {
    return journey;
  }
}

export async function getPendingAssessments({
  userId,
  page = 1,
  perPage = 6,
  locale = "pt",
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

  const items = Array.isArray(data)
    ? await Promise.all(
        data.map(async (item) =>
          withProfileCompetencies(mapUserJourneyToJourney(item, locale), item.journey_profile?.id)
        )
      )
    : [];
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
  const status: JourneyStatus = profile.user_status
    ? STATUS_BY_USER_STATUS[profile.user_status] ?? "not_started"
    : "not_started";

  const score = typeof profile.last_score === "number" ? profile.last_score : undefined;
  const competenciesCount =
    typeof profile.competencies_count === "number" && profile.competencies_count > 0
      ? profile.competencies_count
      : undefined;

  return {
    id,
    // Em inglês, usa o português quando falta a tradução
    title: (isEnglish && profile.name_en) || profile.name_pt,
    description: (isEnglish && profile.description_en) || profile.description_pt || "",
    domain: domain ?? "privacy",
    competenciesCount,
    estimatedMinutes:
      competenciesCount !== undefined ? estimateJourneyMinutes(competenciesCount) : undefined,
    status,
    score,
    href: getProfileSummaryUrl(id),
  };
}

/** Catálogo de jornadas: perfis paginados, buscados e filtrados no backend. */
export async function getCatalogAssessments({
  page = 1,
  limit = 9,
  locale = "pt",
  search,
  domains = [],
  statuses = [],
}: GetCatalogAssessmentsParams = {}): Promise<PaginatedResponse<Journey>> {
  const profilePage = await getJourneyProfiles(page, limit, {
    search,
    domains: domains.map((domain) => DOMAIN_ID_BY_DOMAIN[domain]),
    userStatuses: statuses.map((status) => USER_STATUS_BY_STATUS[status]),
  });

  return {
    items: profilePage.items.map((profile) => mapProfileToJourney(profile, locale)),
    total: profilePage.total,
    page: profilePage.page,
    limit: profilePage.perPage,
    totalPages: profilePage.totalPages,
  };
}
