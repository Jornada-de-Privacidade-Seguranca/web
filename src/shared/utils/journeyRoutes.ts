/**
 * Base das telas da jornada em andamento. As telas sempre operam sobre a
 * jornada em andamento do usuário (no máximo uma por vez), por isso a URL é
 * fixa e não carrega o id da jornada.
 */
export const CURRENT_JOURNEY_BASE_PATH = "/jornada/atual";

/**
 * Monta o caminho das instruções do questionário de competências da jornada em
 * andamento, primeira tela da jornada.
 */
export function getCompetenciesIntroUrl(): string {
  return `${CURRENT_JOURNEY_BASE_PATH}/competencias`;
}

/**
 * Monta o caminho de uma área do questionário de competências da jornada em
 * andamento (índice base 0).
 */
export function getCompetenciesAreaUrl(areaIndex: number): string {
  return `${getCompetenciesIntroUrl()}/${areaIndex}`;
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

/**
 * Monta o caminho do resumo de um perfil de jornada, de onde a jornada é iniciada.
 */
export function getProfileSummaryUrl(profileId: string): string {
  return `/jornada/perfil/${profileId}`;
}
