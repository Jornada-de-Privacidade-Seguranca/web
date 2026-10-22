/**
 * Sequência oficial e ordenada de etapas do pré-questionário da jornada.
 * Conforme definido no "Como funciona" da jornada:
 * 1. Tempo de Experiência Profissional
 * 2. Nível de Proficiência em Inglês
 * 3. Tempo de Atuação no Perfil
 * 4. Formação Acadêmica
 * 5. Certificações Profissionais
 * 6. Competências
 */
export const PRE_QUESTIONNAIRE_STEPS = [
  "experiencia-profissional",
  "english",
  "tempo-atuacao-perfil",
  "formacao-academica",
  "certificacoes-profissionais",
  "competencias",
] as const;

export type PreQuestionnaireStepSlug =
  (typeof PRE_QUESTIONNAIRE_STEPS)[number];

/**
 * Retorna a etapa seguinte à informada na sequência oficial,
 * ou null caso a etapa informada seja a última.
 */
export function getNextPreQuestionnaireStep(
  current: PreQuestionnaireStepSlug
): PreQuestionnaireStepSlug | null {
  const index = PRE_QUESTIONNAIRE_STEPS.indexOf(current);
  return PRE_QUESTIONNAIRE_STEPS[index + 1] ?? null;
}

/**
 * Retorna a etapa anterior à informada na sequência oficial,
 * ou null caso a etapa informada seja a primeira.
 */
export function getPreviousPreQuestionnaireStep(
  current: PreQuestionnaireStepSlug
): PreQuestionnaireStepSlug | null {
  const index = PRE_QUESTIONNAIRE_STEPS.indexOf(current);
  return index > 0 ? PRE_QUESTIONNAIRE_STEPS[index - 1] : null;
}

/**
 * Base das etapas do pré-questionário. As etapas sempre operam sobre a jornada
 * em andamento do usuário (no máximo uma por vez), por isso a URL é fixa e não
 * carrega o id da jornada.
 */
export const CURRENT_JOURNEY_BASE_PATH = "/jornada/atual";

/**
 * Monta o caminho de uma etapa do pré-questionário da jornada em andamento.
 */
export function getCurrentJourneyStepUrl(stepSlug: PreQuestionnaireStepSlug): string {
  return `${CURRENT_JOURNEY_BASE_PATH}/${stepSlug}`;
}

/**
 * Monta o caminho do resumo de uma jornada já criada.
 */
export function getJourneySummaryUrl(journeyId: string): string {
  return `/jornada/${journeyId}`;
}

/**
 * Monta o caminho do resumo de um perfil de jornada, de onde a jornada é iniciada.
 */
export function getProfileSummaryUrl(profileId: string): string {
  return `/jornada/perfil/${profileId}`;
}
