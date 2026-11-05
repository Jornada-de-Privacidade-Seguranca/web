import { describe, it, expect } from "vitest";
import { useJourneyStatsGridVM } from "../journeyStatsGrid.viewmodel";
import type {
  JourneySummary,
  JourneySummaryLabels,
} from "@features/journey-summary/journeySummary.types";

const labels = {
  durationLabel: "Duração",
  areasLabel: "Áreas",
  competenciesLabel: "Competências",
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
    estimatedMinutes: 23,
    areasCount: 13,
    competenciesCount: 39,
    domain: "privacy",
    status: "not_started",
    ...overrides,
  };
}

describe("useJourneyStatsGridVM", () => {
  it("deve exibir duração, áreas e competências da jornada", () => {
    const { stats } = useJourneyStatsGridVM({ journey: buildJourney(), labels });

    expect(stats.map((s) => s.key)).toEqual(["duration", "areas", "competencies"]);
    expect(stats.map((s) => [s.value, s.ariaLabel])).toEqual([
      ["23 min", "23 minutos de duração"],
      ["13", "13 áreas"],
      ["39", "39 competências"],
    ]);
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

    expect(stats.map((s) => [s.value, s.ariaLabel])).toEqual([
      ["—", "Duração: não disponível"],
      ["—", "Áreas: não disponível"],
      ["—", "Competências: não disponível"],
    ]);
  });
});
