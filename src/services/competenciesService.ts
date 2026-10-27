import { apiRequest } from "@services/httpClient";
import type {
  CompetencyAnswerPayload,
  CompetencyAnswerResponse,
  CompetencyOptionResponse,
  CompetencyStateResponse,
  JourneyFinalizationResponse,
  SaveCompetenciesPayload,
} from "@features/competencies-questionnaire/competenciesQuestionnaire.types";

/**
 * Todas as rotas operam sobre a jornada em andamento do usuário autenticado.
 * Falhas são lançadas como ApiRequestError, com o status HTTP e o `code` do
 * backend (ex.: 404 ONGOING_JOURNEY_NOT_FOUND, 422 INCOMPLETE_JOURNEY).
 */

/** Competências do perfil da jornada (ordenadas por id no backend). */
export async function getCompetencyOptions(): Promise<CompetencyOptionResponse[]> {
  return apiRequest<CompetencyOptionResponse[]>(
    "/journeys/current/competencies/options",
    {},
    "Não foi possível carregar as competências da jornada."
  );
}

/** Respostas já salvas na jornada em andamento. */
export async function getSavedCompetencies(): Promise<CompetencyAnswerResponse[]> {
  const state = await apiRequest<CompetencyStateResponse>(
    "/journeys/current/competencies",
    {},
    "Não foi possível carregar as respostas salvas."
  );
  return state?.competencies ?? [];
}

/** Substitui a lista inteira de respostas da jornada em andamento. */
export async function saveCompetencies(
  answers: CompetencyAnswerPayload[]
): Promise<CompetencyAnswerResponse[]> {
  const payload: SaveCompetenciesPayload = { competencies: answers };
  const state = await apiRequest<CompetencyStateResponse>(
    "/journeys/current/competencies",
    { method: "put", data: payload, withCsrf: true },
    "Não foi possível salvar as respostas."
  );
  return state?.competencies ?? [];
}

/** Finaliza a jornada em andamento, que passa a ter pontuação e resultado. */
export async function finalizeCurrentJourney(): Promise<JourneyFinalizationResponse> {
  return apiRequest<JourneyFinalizationResponse>(
    "/journeys/current/finalize",
    { method: "post", withCsrf: true },
    "Não foi possível finalizar a jornada."
  );
}
