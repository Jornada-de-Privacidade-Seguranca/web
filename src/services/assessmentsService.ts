import { apiRequest, apiRequestWithMeta } from "@services/httpClient";
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
  search?: string;
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

export async function getCatalogAssessments(
  params: GetCatalogAssessmentsParams = {}
): Promise<PaginatedResponse<Journey>> {
  const { page = 1, limit = 6, search } = params;
  return apiRequest<PaginatedResponse<Journey>>(
    "/assessments",
    { params: { page, limit, ...(search ? { search } : {}) } },
    "Erro ao carregar catálogo de jornadas."
  );
}
