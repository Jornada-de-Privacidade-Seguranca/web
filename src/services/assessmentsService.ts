import { apiRequestWithMeta } from "@services/httpClient";
import {
  getJourneyProfiles,
  type JourneyProfileApi,
} from "@services/journeyProfileService";
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
    competenciesCount: item.summary?.acquired_knowledges_count || 12,
    estimatedMinutes: 20,
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

function mapProfileToJourney(profile: JourneyProfileApi, locale: "pt" | "en"): Journey {
  const isEnglish = locale === "en";
  const id = String(profile.id);
  const domain = profile.type ? DOMAIN_BY_TYPE_MAP[profile.type] : undefined;
  const competenciesCount = 10;
  const estimatedMinutes = 15;

  return {
    id,
    title: (isEnglish ? profile.name_en : profile.name_pt) || profile.name_pt,
    description: (isEnglish ? profile.description_en : profile.description_pt) ?? "",
    domain: domain ?? "privacy",
    competenciesCount,
    estimatedMinutes,
    status: "not_started",
    href: getProfileSummaryUrl(id),
  };
}

/**
 * Catálogo de jornadas: perfis de GET /journey-profiles, paginados no backend.
 * O padrão para exibição nesta issue é de 9 por página.
 */
export async function getCatalogAssessments({
  page = 1,
  limit = 9,
  locale = "pt",
}: GetCatalogAssessmentsParams = {}): Promise<PaginatedResponse<Journey>> {
  const profilePage = await getJourneyProfiles(page, limit);
  const items = profilePage.items.map((profile) => mapProfileToJourney(profile, locale));

  return {
    items,
    total: profilePage.total,
    page: profilePage.page,
    limit: profilePage.perPage,
    totalPages: profilePage.totalPages,
  };
}
