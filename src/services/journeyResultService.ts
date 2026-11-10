import axios from "axios";
import { ApiRequestError, apiRequest, axiosInstance } from "@services/httpClient";
import { parseContentDispositionFilename } from "@shared/utils/fileDownload";
import type {
  JourneyResultApi,
  JourneyResultPdfFile,
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

/**
 * Baixa o PDF do resultado de uma jornada concluída (GET /journeys/{journey}/pdf),
 * no idioma informado. O nome do arquivo vem do Content-Disposition; sem o
 * cabeçalho, usa resultado-jornada-{id}.pdf. Falhas são lançadas como
 * ApiRequestError com o status HTTP; o 401 já passa pelo tratamento de sessão
 * expirada do axiosInstance.
 */
export async function downloadJourneyResultPdf(
  journeyId: string,
  locale: string
): Promise<JourneyResultPdfFile> {
  try {
    const response = await axiosInstance.get<Blob>(
      `/journeys/${encodeURIComponent(journeyId)}/pdf`,
      { params: { locale }, responseType: "blob", headers: { Accept: "application/pdf" } }
    );
    const header = response.headers["content-disposition"] as string | undefined;
    return {
      blob: response.data,
      filename: parseContentDispositionFilename(header) ?? `resultado-jornada-${journeyId}.pdf`,
    };
  } catch (err: unknown) {
    throw new ApiRequestError(
      "Não foi possível gerar o PDF do resultado.",
      axios.isAxiosError(err) ? err.response?.status : undefined
    );
  }
}
