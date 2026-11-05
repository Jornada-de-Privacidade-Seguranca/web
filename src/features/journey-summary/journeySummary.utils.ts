import type { JourneySummary } from "./journeySummary.types";

/**
 * Iniciar a partir de um perfil ou refazer uma jornada concluída cria uma
 * jornada nova no backend; jornadas em andamento apenas continuam.
 */
export function requiresJourneyCreation(journey: JourneySummary): boolean {
  return journey.id === null || journey.status === "completed";
}
