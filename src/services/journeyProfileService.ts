import axios from "axios";
import {
  apiRequest,
  apiRequestWithMeta,
  axiosInstance,
  type ApiResponse,
} from "@services/httpClient";
import type { PaginationMetaApi } from "@features/assessments/assessments.types";

/** Perfil de jornada como vem de GET /journey-profiles e /journey-profiles/{id}. */
export interface JourneyProfileApi {
  id: number;
  name_pt: string;
  name_en: string;
  description_pt: string | null;
  description_en: string | null;
  /** Id do domínio de conhecimento (1 = privacidade, 2 = segurança, 3 = conjunta) */
  type: number | null;
  /** Situação do perfil para o usuário autenticado, na listagem (#147) */
  user_status?: JourneyProfileUserStatusApi | null;
  last_score?: number | null;
  competencies_count?: number | null;
}

/** Situação do perfil para o usuário em GET /journey-profiles (`user_status`). */
export type JourneyProfileUserStatusApi = "completed" | "pending" | "not_done";

/** Busca e filtros aceitos por GET /journey-profiles. */
export interface JourneyProfileListFilters {
  /** Procura pelo nome do perfil */
  search?: string;
  /** Ids dos domínios de conhecimento (1, 2 e 3) */
  domains?: number[];
  userStatuses?: JourneyProfileUserStatusApi[];
}

export interface JourneyProfilePage {
  items: JourneyProfileApi[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export type JourneyProfileErrorType = "not_found" | "server_error";

export class JourneyProfileRequestError extends Error {
  readonly type: JourneyProfileErrorType;

  constructor(type: JourneyProfileErrorType, message: string) {
    super(message);
    this.name = "JourneyProfileRequestError";
    this.type = type;
  }
}

/** Catálogo de perfis de jornada, com paginação, busca e filtros no backend. */
export async function getJourneyProfiles(
  page: number,
  perPage: number,
  filters: JourneyProfileListFilters = {}
): Promise<JourneyProfilePage> {
  const params: Record<string, unknown> = { page, per_page: perPage };
  const search = filters.search?.trim();
  if (search) params.search = search;
  if (filters.domains?.length) params["domains[]"] = filters.domains;
  if (filters.userStatuses?.length) params["user_status[]"] = filters.userStatuses;

  const { data, meta } = await apiRequestWithMeta<
    JourneyProfileApi[],
    { pagination?: PaginationMetaApi }
  >(
    "/journey-profiles",
    { params },
    "Erro ao carregar o catálogo de jornadas."
  );

  const items = Array.isArray(data) ? data : [];
  const pagination = meta?.pagination;
  return {
    items,
    page: pagination?.current_page ?? page,
    perPage: pagination?.per_page ?? perPage,
    total: pagination?.total ?? items.length,
    totalPages: Math.max(pagination?.last_page ?? 1, 1),
  };
}

/** Detalhe de um perfil de jornada. */
export async function getJourneyProfile(profileId: string): Promise<JourneyProfileApi> {
  try {
    const response = await axiosInstance.get<ApiResponse<JourneyProfileApi>>(
      `/journey-profiles/${profileId}`
    );
    return response.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response && [404, 422].includes(err.response.status)) {
      throw new JourneyProfileRequestError("not_found", "Perfil de jornada não encontrado.");
    }
    throw new JourneyProfileRequestError(
      "server_error",
      "Não foi possível carregar o perfil de jornada."
    );
  }
}

/** Resposta de PUT /me/journey-profile. */
export interface SelectedJourneyProfileApi {
  journey_profile_id: number;
  journey_profile: JourneyProfileApi | null;
}

/**
 * Salva o perfil de jornada inicial do usuário, exigido pelo backend antes da
 * primeira jornada. Falhas seguem como ApiRequestError, com o `code` da API
 * (por exemplo, JOURNEY_PROFILE_SELECTION_LOCKED).
 */
export async function selectInitialJourneyProfile(
  journeyProfileId: number
): Promise<SelectedJourneyProfileApi> {
  return apiRequest<SelectedJourneyProfileApi>(
    "/me/journey-profile",
    { method: "put", data: { journey_profile_id: journeyProfileId }, withCsrf: true },
    "Não foi possível salvar o perfil de jornada."
  );
}
