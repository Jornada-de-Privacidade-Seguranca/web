import { describe, it, expect } from "vitest";
import { resolveDifficultyLevel } from "../difficultyLevel";

describe("resolveDifficultyLevel", () => {
  it.each([
    ["Iniciante", "beginner"],
    ["Básico", "basic"],
    ["BASICO", "basic"],
    ["Intermediário", "intermediate"],
    ["  Avançado ", "advanced"],
    ["Especialista", "specialist"],
  ] as const)("deve reconhecer %s ignorando acentos, maiúsculas e espaços", (name, level) => {
    expect(resolveDifficultyLevel(name)).toBe(level);
  });

  it("deve usar o nome em inglês quando o português não for reconhecido", () => {
    expect(resolveDifficultyLevel("Nível 2", "Intermediary")).toBe("intermediate");
    expect(resolveDifficultyLevel(null, "Specialist")).toBe("specialist");
  });

  it("deve retornar null para nomes desconhecidos ou ausentes", () => {
    expect(resolveDifficultyLevel("Mestre", "Master")).toBeNull();
    expect(resolveDifficultyLevel(null, undefined)).toBeNull();
  });
});
