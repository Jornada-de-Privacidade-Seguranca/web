import { apiRequest } from "@services/httpClient";
import type {
  CertificationOptionResponse,
  CertificationSelectionResponse,
  SaveCertificationsPayload,
} from "@features/pre-questionnaire-certifications/certificationsStep.types";

/**
 * Todas as rotas operam sobre a jornada em andamento do usuário autenticado.
 * Falhas são lançadas como ApiRequestError, com o status HTTP e o `code` do
 * backend (ex.: 404 ONGOING_JOURNEY_NOT_FOUND, 422 VALIDATION_ERROR).
 */

/** Certificações disponíveis (ordenadas por id no backend). */
export async function getCertificationOptions(): Promise<CertificationOptionResponse[]> {
  return apiRequest<CertificationOptionResponse[]>(
    "/journeys/current/certifications/options",
    {},
    "Não foi possível carregar as certificações disponíveis."
  );
}

/** Certificações já selecionadas na jornada em andamento. */
export async function getSelectedCertifications(): Promise<CertificationOptionResponse[]> {
  const selection = await apiRequest<CertificationSelectionResponse>(
    "/journeys/current/certifications",
    {},
    "Não foi possível carregar as certificações selecionadas."
  );
  return selection?.certifications ?? [];
}

/** Substitui a lista inteira de certificações da jornada em andamento. */
export async function saveSelectedCertifications(
  certificationIds: number[]
): Promise<CertificationOptionResponse[]> {
  const payload: SaveCertificationsPayload = { certification_ids: certificationIds };
  const selection = await apiRequest<CertificationSelectionResponse>(
    "/journeys/current/certifications",
    { method: "put", data: payload, withCsrf: true },
    "Não foi possível salvar as certificações selecionadas."
  );
  return selection?.certifications ?? [];
}
