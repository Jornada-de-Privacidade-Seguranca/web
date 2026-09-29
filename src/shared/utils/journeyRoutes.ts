export type JourneyRoutePrefix = "jornada" | "journey";

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
 * Identifica o prefixo da rota baseado no pathname atual.
 * Suporta tanto as rotas em português (/jornada) quanto em inglês (/journey).
 */
export function getJourneyRoutePrefix(
  pathname: string | null | undefined
): JourneyRoutePrefix {
  return pathname?.startsWith("/jornada") ? "jornada" : "journey";
}

/**
 * Monta o caminho relativo de uma etapa específica do pré-questionário.
 */
export function getJourneyStepUrl(
  prefix: JourneyRoutePrefix,
  journeySlug: string,
  stepSlug: PreQuestionnaireStepSlug
): string {
  return `/${prefix}/${journeySlug}/${stepSlug}`;
}

/**
 * Monta o caminho relativo do sumário/apresentação da jornada.
 */
export function getJourneySummaryUrl(
  prefix: JourneyRoutePrefix,
  journeySlug: string
): string {
  return `/${prefix}/${journeySlug}`;
}

/**
 * Formata um slug com hífens para formato legível (Title Case).
 * Exemplo: "data-governance" -> "Data Governance"
 */
export function formatJourneyTitleFromSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
