/** Níveis de dificuldade de uma competência, na ordem crescente. */
export type DifficultyLevel = "beginner" | "basic" | "intermediate" | "advanced" | "specialist";

const LEVEL_BY_NAME: Record<string, DifficultyLevel> = {
  iniciante: "beginner",
  beginner: "beginner",
  basico: "basic",
  basic: "basic",
  intermediario: "intermediate",
  intermediary: "intermediate",
  intermediate: "intermediate",
  avancado: "advanced",
  advanced: "advanced",
  especialista: "specialist",
  specialist: "specialist",
};

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Identifica o nível pelo nome vindo do backend, sem acentos e em minúsculas,
 * o mesmo critério que o backend usa no cálculo da nota. Compara o nome em
 * português e em inglês; um nome desconhecido resulta em null.
 */
export function resolveDifficultyLevel(
  ...names: Array<string | null | undefined>
): DifficultyLevel | null {
  for (const name of names) {
    if (!name) continue;
    const level = LEVEL_BY_NAME[normalizeName(name)];
    if (level) return level;
  }
  return null;
}
