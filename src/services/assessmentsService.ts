import { apiRequestWithMeta } from "@services/httpClient";
import { getJourneyProfiles, type JourneyProfileApi } from "@services/journeyProfileService";
import { getProfileSummaryUrl } from "@shared/utils/journeyRoutes";
import type {
  Journey,
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

function mapUserJourneyToJourney(item: UserJourneyListItemApi): Journey {
  // O endpoint não expõe totalQuestions, estimatedMinutes nem score; ficam
  // ausentes e o card deixa de exibi-los. Quando `name` não vier do backend,
  // fazemos fallback para `description` para garantir que o título do card
  // não fique vazio.
  const profile = item.journey_profile;
  const title = profile?.name || profile?.description || "";
  const description = profile?.name ? (profile?.description ?? "") : "";

  return {
    id: String(item.id),
    title,
    description,
    status: USER_JOURNEY_STATUS_MAP[item.status] ?? "in_progress",
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
  return {
    id,
    title: (isEnglish ? profile.name_en : profile.name_pt) || profile.name_pt,
    description: (isEnglish ? profile.description_en : profile.description_pt) ?? "",
    // Perfis do catálogo ainda não viraram jornada: o card leva ao resumo do
    // perfil, onde "Iniciar jornada" cria a jornada no backend
    status: "not_started",
    href: getProfileSummaryUrl(id),
  };
}

/**
 * Catálogo de jornadas: perfis de GET /journey-profiles, paginados no backend.
 * O endpoint não tem busca por texto; a busca do catálogo é feita na View
 * Model sobre a página carregada.
 */
export async function getCatalogAssessments(
  params: GetCatalogAssessmentsParams = {}
): Promise<PaginatedResponse<Journey>> {
  const { page = 1, limit = 6, locale = "pt" } = params;
  const result = await getJourneyProfiles(page, limit);
  return {
    items: result.items.map((profile) => mapProfileToJourney(profile, locale)),
    total: result.total,
    page: result.page,
    limit: result.perPage,
    totalPages: result.totalPages,
  };
}
