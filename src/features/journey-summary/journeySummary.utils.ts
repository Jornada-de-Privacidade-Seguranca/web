import {
  getCurrentJourneyStepUrl,
  type PreQuestionnaireStepSlug,
} from "@shared/utils/journeyRoutes";
import type { JourneySummary } from "./journeySummary.types";

/**
 * Etapa de onde a jornada em andamento deve seguir: a última resposta salva,
 * ou a primeira etapa quando ainda não houver resposta. As etapas usam a URL
 * fixa da jornada em andamento.
 */
export function resolveJourneyStartUrl(journey: JourneySummary): string {
  const { status, progress } = journey;

  const stepSlug =
    status === "in_progress" && progress.lastAnsweredStepSlug
      ? progress.lastAnsweredStepSlug
      : progress.firstStepSlug;

  return getCurrentJourneyStepUrl(stepSlug as PreQuestionnaireStepSlug);
}

/**
 * Iniciar a partir de um perfil ou refazer uma jornada concluída cria uma
 * jornada nova no backend; jornadas em andamento apenas continuam.
 */
export function requiresJourneyCreation(journey: JourneySummary): boolean {
  return journey.id === null || journey.status === "completed";
}
