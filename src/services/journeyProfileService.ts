import axios from "axios";
import { apiRequestWithMeta, axiosInstance, type ApiResponse } from "@services/httpClient";
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
