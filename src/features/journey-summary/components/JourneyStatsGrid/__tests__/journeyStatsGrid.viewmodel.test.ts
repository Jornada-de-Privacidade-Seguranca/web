import { describe, it, expect } from "vitest";
import { useJourneyStatsGridVM } from "../journeyStatsGrid.viewmodel";
import type {
  JourneySummary,
  JourneySummaryLabels,
} from "@features/journey-summary/journeySummary.types";

const labels = {
  stepsCountLabel: "Etapas",
  durationLabel: "Duração",
  areasLabel: "Áreas",
  competenciesLabel: "Competências",
  stepsCountAriaLabel: (count: number) => `${count} etapas`,
  stepsProgressText: (completed: number, total: number) => `${completed} de ${total}`,
  stepsProgressAriaLabel: (completed: number, total: number) =>
    `${completed} de ${total} etapas concluídas`,
  durationAriaLabel: (minutes: number) => `${minutes} minutos de duração`,
  areasAriaLabel: (count: number) => `${count} áreas`,
  competenciesAriaLabel: (count: number) => `${count} competências`,
  estimatedMinutesText: (minutes: number) => `${minutes} min`,
} as unknown as JourneySummaryLabels;

function buildJourney(overrides?: Partial<JourneySummary>): JourneySummary {
  return {
    id: "78",
    title: "Encarregado de Dados",
    stepsCount: 6,
    completedStepsCount: 0,
    estimatedMinutes: 23,
    areasCount: 13,
    competenciesCount: 39,
    status: "not_started",
    progress: { firstStepSlug: "experiencia-profissional", lastAnsweredStepSlug: null },
    ...overrides,
  };
}

describe("useJourneyStatsGridVM", () => {
  it("deve exibir só o total de etapas quando a jornada não foi iniciada", () => {
    const { stats } = useJourneyStatsGridVM({ journey: buildJourney(), labels });

    expect(stats.map((s) => s.key)).toEqual(["steps", "duration", "areas", "competencies"]);
    expect(stats[0]).toMatchObject({
      value: "6",
      label: "Etapas",
      ariaLabel: "6 etapas",
    });
    expect(stats[1].value).toBe("23 min");
  });

  it.each([
    ["in_progress", 2, "2 de 6"],
    ["completed", 6, "6 de 6"],
  ] as const)("deve exibir o progresso quando a jornada está %s", (status, completed, expected) => {
    const { stats } = useJourneyStatsGridVM({
      journey: buildJourney({ status, completedStepsCount: completed }),
      labels,
    });

    expect(stats[0].value).toBe(expected);
    expect(stats[0].ariaLabel).toBe(`${expected} etapas concluídas`);
  });
});
