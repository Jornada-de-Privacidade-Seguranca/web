/** Faixas de nota, as mesmas do badge de nota da tela de Resultados. */
export type ScoreBand = "strong" | "medium" | "weak";

/** Nota mínima de cada faixa. */
const STRONG_MIN_SCORE = 75;
const MEDIUM_MIN_SCORE = 60;

/** Limita a nota ao intervalo 0–100 e arredonda para inteiro. */
export function normalizeScore(score: number | null | undefined): number {
  const value = Number(score);
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Identifica a faixa da nota: Forte (>= 75), Médio (60–74) e A desenvolver (< 60). */
export function resolveScoreBand(score: number): ScoreBand {
  if (score >= STRONG_MIN_SCORE) return "strong";
  if (score >= MEDIUM_MIN_SCORE) return "medium";
  return "weak";
}
