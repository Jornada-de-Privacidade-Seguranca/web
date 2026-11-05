import { describe, it, expect, vi, beforeEach } from "vitest";
import * as journeyService from "../journeyService";
import type { JourneyDetailApi } from "../journeyService";
import {
  estimateJourneyMinutes,
  getJourneySummary,
  mapJourneyToSummary,
  JourneySummaryRequestError,
} from "../journeySummaryService";

function buildJourney(overrides?: Partial<JourneyDetailApi>): JourneyDetailApi {
  return {
    id: 78,
    journey_profile: {
      id: 1,
      name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
      name_en: "Data Protection Officer",
      knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
      competencies: [
        { id: 1, knowledge_area: { id: 1, name_pt: "A", name_en: "A" } },
        { id: 2, knowledge_area: { id: 1, name_pt: "A", name_en: "A" } },
        { id: 3, knowledge_area: { id: 2, name_pt: "B", name_en: "B" } },
      ],
    },
    status: "ongoing",
    answers: {
      professional_experience: null,
      english_proficiency: null,
      profile_experience: null,
      higher_education_courses: [],
    },
    professional_certifications: [],
    acquired_knowledges: [],
    ...overrides,
  };
}

describe("journeySummaryService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("mapJourneyToSummary", () => {
    it("deve montar o resumo com título no idioma, competências e áreas distintas", () => {
      const summary = mapJourneyToSummary(buildJourney(), "pt");

      expect(summary).toMatchObject({
        id: "78",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        competenciesCount: 3,
        areasCount: 2,
        stepsCount: 6,
        completedStepsCount: 0,
        // 3 competências × 20 s = 60 s → 1 min
        estimatedMinutes: 1,
        status: "not_started",
      });
      expect(summary).not.toHaveProperty("progress");
      expect(mapJourneyToSummary(buildJourney(), "en").title).toBe(
        "Data Protection Officer"
      );
    });

    it("deve considerar em andamento a jornada com respostas", () => {
      const summary = mapJourneyToSummary(
        buildJourney({
          answers: {
            professional_experience: { id: 3 },
            english_proficiency: { id: 2 },
            profile_experience: null,
            higher_education_courses: [],
          },
        }),
        "pt"
      );

      expect(summary.status).toBe("in_progress");
      expect(summary.completedStepsCount).toBe(2);
    });

    it("deve marcar como concluída a jornada com status completed", () => {
      const summary = mapJourneyToSummary(
        buildJourney({ status: "completed", acquired_knowledges: [{}] }),
        "pt"
      );

      expect(summary.status).toBe("completed");
      expect(summary.completedStepsCount).toBe(6);
    });
  });

  describe("estimateJourneyMinutes", () => {
    it("deve somar 20 s por competência, arredondando para cima, com mínimo de 1 min", () => {
      // 39 × 20 s = 780 s = 13 min
      expect(estimateJourneyMinutes(39)).toBe(13);
      // 4 × 20 s = 80 s ≈ 1,3 min → 2 min
      expect(estimateJourneyMinutes(4)).toBe(2);
      // sem competências, o mínimo é 1 min
      expect(estimateJourneyMinutes(0)).toBe(1);
    });
  });

  describe("getJourneySummary", () => {
    it("deve buscar a jornada e devolver o resumo mapeado", async () => {
      const getSpy = vi
        .spyOn(journeyService, "getJourney")
        .mockResolvedValue(buildJourney());

      const summary = await getJourneySummary("78", "pt");

      expect(getSpy).toHaveBeenCalledWith("78");
      expect(summary.title).toBe("Encarregado pelo Tratamento de Dados Pessoais");
    });

    it.each([
      ["not_found", "not_found"],
      ["server_error", "server_error"],
    ] as const)("deve converter erro %s da jornada em erro %s do resumo", async (type, expected) => {
      vi.spyOn(journeyService, "getJourney").mockRejectedValue(
        new journeyService.JourneyRequestError(type, "erro")
      );

      const error = await getJourneySummary("78", "pt").catch((e) => e);
      expect(error).toBeInstanceOf(JourneySummaryRequestError);
      expect(error.type).toBe(expected);
    });
  });
});
