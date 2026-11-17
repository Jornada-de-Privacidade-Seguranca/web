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
  knowledge_domain?: {
    id: number | null;
    name_pt: string | null;
    name_en: string | null;
  } | null;
  /** Campos estendidos para métricas e status do usuário (issue #147 / #98) */
  user_status?: string | null;
  last_score?: number | null;
  competencies_count?: number | null;
  estimated_minutes?: number | null;
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

/** Catálogo de perfis de jornada, paginado no backend (sem busca por texto). */
export async function getJourneyProfiles(
  page: number,
  perPage: number
): Promise<JourneyProfilePage> {
  const { data, meta } = await apiRequestWithMeta<
    JourneyProfileApi[],
    { pagination?: PaginationMetaApi }
  >(
    "/journey-profiles",
    { params: { page, per_page: perPage } },
    "Erro ao carregar o catálogo de jornadas."
  );

  const items = Array.isArray(data) ? data : [];
  const pagination = meta?.pagination;
  return {
    items,
    page: pagination?.current_page ?? page,
    perPage: pagination?.per_page ?? perPage,
    total: pagination?.total ?? items.length,
    totalPages: pagination?.last_page ?? 1,
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
