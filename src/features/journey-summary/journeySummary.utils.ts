import { ApiRequestError } from "@services/httpClient";
import type { JourneySummary, ProfileSelectionErrorType } from "./journeySummary.types";

/**
 * Iniciar a partir de um perfil ou refazer uma jornada concluída cria uma
 * jornada nova no backend; jornadas em andamento apenas continuam.
 */
export function requiresJourneyCreation(journey: JourneySummary): boolean {
  return journey.id === null || journey.status === "completed";
}

const PROFILE_SELECTION_ERRORS: Record<string, ProfileSelectionErrorType> = {
  JOURNEY_PROFILE_SELECTION_REQUIRED: "selectionRequired",
  JOURNEY_PROFILE_MISMATCH: "profileMismatch",
  JOURNEY_PROFILE_SELECTION_LOCKED: "selectionLocked",
  JOURNEY_PROFILE_NOT_FOUND: "profileNotFound",
};

/**
 * Erro do perfil de jornada inicial pelo `code` da API; null quando a falha não
 * é desse tipo (falha geral).
 */
export function getProfileSelectionErrorType(error: unknown): ProfileSelectionErrorType | null {
  if (!(error instanceof ApiRequestError) || !error.code) return null;
  return PROFILE_SELECTION_ERRORS[error.code] ?? null;
}
