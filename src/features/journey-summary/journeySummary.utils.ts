import {
  getJourneySummaryUrl,
  type JourneyRoutePrefix,
} from "@shared/utils/journeyRoutes";
import type { JourneySummary } from "./journeySummary.types";

/**
 * Resolve fills para status not_started/completed sempre a primeira etapa; jornadas
 * em andamento retomam da última resposta salva, caindo para a primeira etapa
 * quando ainda não houver nenhuma resposta registrada.
 */
export function resolveJourneyStartUrl(
  journey: JourneySummary,
  routePrefix: JourneyRoutePrefix = "jornada"
): string {
  const { id, status, progress } = journey;

  const stepSlug =
    status === "in_progress" && progress.lastAnsweredStepSlug
      ? progress.lastAnsweredStepSlug
      : progress.firstStepSlug;

  // As etapas são identificadas pelo id da jornada, o mesmo usado pela rota do
  // resumo, para que o "Voltar" da primeira etapa retorne a esta tela.
  return `${getJourneySummaryUrl(routePrefix, id)}/${stepSlug}`;
}
