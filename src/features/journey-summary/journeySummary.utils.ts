import type { JourneySummary } from "./journeySummary.types";

/**
 * Resolve fills para status not_started/completed sempre a primeira etapa; jornadas
 * em andamento retomam da última resposta salva, caindo para a primeira etapa
 * quando ainda não houver nenhuma resposta registrada.
 */
export function resolveJourneyStartUrl(journey: JourneySummary): string {
  const { slug, status, progress } = journey;

  const stepSlug =
    status === "in_progress" && progress.lastAnsweredStepSlug
      ? progress.lastAnsweredStepSlug
      : progress.firstStepSlug;

  return `/journey/${slug}/${stepSlug}`;
}
