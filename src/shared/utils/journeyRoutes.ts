/**
 * Base das telas da jornada em andamento. As telas sempre operam sobre a
 * jornada em andamento do usuário (no máximo uma por vez), por isso a URL é
 * fixa e não carrega o id da jornada.
 */
export const CURRENT_JOURNEY_BASE_PATH = "/jornada/atual";

/** Base do questionário de competências da jornada em andamento. */
const COMPETENCIES_BASE_PATH = `${CURRENT_JOURNEY_BASE_PATH}/competencias`;

/**
 * Monta o caminho de uma área do questionário de competências da jornada em
 * andamento (índice base 0). A primeira área é a primeira tela da jornada: as
 * instruções ficam no resumo.
 */
export function getCompetenciesAreaUrl(areaIndex: number): string {
  return `${COMPETENCIES_BASE_PATH}/${areaIndex}`;
}

/**
 * Monta o caminho do resumo de uma jornada já criada.
 */
export function getJourneySummaryUrl(journeyId: string): string {
  return `/jornada/${journeyId}`;
}

/**
 * Monta o caminho do resultado de uma jornada concluída. O resultado é de uma
 * jornada específica, então a URL carrega o id (diferente das etapas em andamento).
 */
export function getJourneyResultUrl(journeyId: string): string {
  return `/jornada/${journeyId}/resultado`;
}

/** Listagem de resultados de todos os usuários, na visão do admin. */
export const ADMIN_RESULTS_PATH = "/admin/resultados";

function withQuery(path: string, query?: string): string {
  const normalized = (query ?? "").replace(/^\?/, "");
  return normalized ? `${path}?${normalized}` : path;
}

/**
 * Monta o caminho do resultado de uma jornada visto pelo admin. A query string
 * da listagem vai junto, para o "Voltar" devolver os mesmos filtros e página.
 */
export function getAdminJourneyResultUrl(journeyId: string, listQuery?: string): string {
  return withQuery(`${ADMIN_RESULTS_PATH}/${journeyId}`, listQuery);
}

/** Monta o caminho da listagem de resultados do admin com os filtros informados. */
export function getAdminResultsUrl(listQuery?: string): string {
  return withQuery(ADMIN_RESULTS_PATH, listQuery);
}

/**
 * Monta o caminho do resumo de um perfil de jornada, de onde a jornada é iniciada.
 */
export function getProfileSummaryUrl(profileId: string): string {
  return `/jornada/perfil/${profileId}`;
}
