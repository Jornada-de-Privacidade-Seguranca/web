import { ApiRequestError, apiRequest } from "@services/httpClient";
import type {
  JourneyResultApi,
  JourneyResultRequestErrorType,
} from "@features/journey-result/journeyResult.types";

export class JourneyResultRequestError extends Error {
  readonly type: JourneyResultRequestErrorType;

  constructor(type: JourneyResultRequestErrorType, message: string) {
    super(message);
    this.name = "JourneyResultRequestError";
    this.type = type;
  }
}

/**
 * Status HTTP de GET /journeys/{journey} e o erro correspondente da tela. O
 * 422 vem de um id inválido na rota, tratado como jornada inexistente.
 */
const ERROR_TYPE_BY_STATUS: Record<number, JourneyResultRequestErrorType> = {
  403: "forbidden",
  404: "not_found",
  409: "incomplete",
  422: "not_found",
};

/**
 * Busca a jornada com os dados do resultado. Falhas são lançadas como
 * JourneyResultRequestError: 404 JOURNEY_NOT_FOUND, 403 JOURNEY_FORBIDDEN,
 * 409 INCOMPLETE_JOURNEY e, para 500 ou falha de rede, "server_error".
 */
export async function getJourneyResult(journeyId: string): Promise<JourneyResultApi> {
  try {
    return await apiRequest<JourneyResultApi>(
      `/journeys/${encodeURIComponent(journeyId)}`,
      {},
      "Não foi possível carregar o resultado da jornada."
    );
  } catch (err: unknown) {
    const status = err instanceof ApiRequestError ? err.status : undefined;
    const type = (status && ERROR_TYPE_BY_STATUS[status]) || "server_error";
    throw new JourneyResultRequestError(
      type,
      err instanceof Error ? err.message : "Não foi possível carregar o resultado da jornada."
    );
  }
}
