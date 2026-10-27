import { apiRequest } from "@services/httpClient";
import type {
  CourseOptionResponse,
  SaveCoursesPayload,
} from "@features/pre-questionnaire-academic/academicStep.types";

/**
 * Todas as rotas operam sobre a jornada em andamento do usuário autenticado.
 * Falhas são lançadas como ApiRequestError, com o status HTTP e o `code` do
 * backend (ex.: 404 ONGOING_JOURNEY_NOT_FOUND, 422 VALIDATION_ERROR).
 */

/** Cursos disponíveis de todos os níveis (sem `type_id`), ordenados por nome. */
export async function getCourseOptions(): Promise<CourseOptionResponse[]> {
  return apiRequest<CourseOptionResponse[]>(
    "/journeys/current/courses/options",
    {},
    "Não foi possível carregar os cursos disponíveis."
  );
}

/** Cursos já selecionados na jornada em andamento. */
export async function getSelectedCourses(): Promise<CourseOptionResponse[]> {
  return apiRequest<CourseOptionResponse[]>(
    "/journeys/current/courses",
    {},
    "Não foi possível carregar os cursos selecionados."
  );
}

/** Substitui a lista inteira de cursos da jornada em andamento. */
export async function saveSelectedCourses(
  courseIds: number[]
): Promise<CourseOptionResponse[]> {
  const payload: SaveCoursesPayload = { course_ids: courseIds };
  return apiRequest<CourseOptionResponse[]>(
    "/journeys/current/courses",
    { method: "put", data: payload, withCsrf: true },
    "Não foi possível salvar os cursos selecionados."
  );
}
