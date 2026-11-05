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
  notAvailable: "—",
  notAvailableAriaLabel: (label: string) => `${label}: não disponível`,
} as unknown as JourneySummaryLabels;

function buildJourney(overrides?: Partial<JourneySummary>): JourneySummary {
  return {
    id: "78",
    profileId: "1",
    title: "Encarregado de Dados",
    stepsCount: 6,
    completedStepsCount: 0,
    estimatedMinutes: 23,
    areasCount: 13,
    competenciesCount: 39,
    status: "not_started",
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

  it("deve exibir \"—\" quando duração, áreas e competências não estiverem disponíveis", () => {
    const { stats } = useJourneyStatsGridVM({
      journey: buildJourney({
        id: null,
        estimatedMinutes: null,
        areasCount: null,
        competenciesCount: null,
      }),
      labels,
    });

    expect(stats.slice(1).map((s) => [s.value, s.ariaLabel])).toEqual([
      ["—", "Duração: não disponível"],
      ["—", "Áreas: não disponível"],
      ["—", "Competências: não disponível"],
    ]);
    expect(stats[0].value).toBe("6");
  });
});
