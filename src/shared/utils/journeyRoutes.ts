export type JourneyRoutePrefix = "jornada" | "journey";

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
  stepSlug: string
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
