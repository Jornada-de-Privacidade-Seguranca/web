import { describe, it, expect, vi, beforeEach } from "vitest";
import * as journeyService from "../journeyService";
import * as journeyProfileService from "../journeyProfileService";
import * as httpClient from "../httpClient";
import type { JourneyDetailApi } from "../journeyService";
import {
  estimateJourneyMinutes,
  getJourneySummary,
  getLastProfileScore,
  getProfileSummary,
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
        // 3 competências × 20 s = 60 s → 1 min
        estimatedMinutes: 1,
        domain: "privacy",
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
    });

    it("deve marcar como concluída a jornada com status completed", () => {
      const summary = mapJourneyToSummary(
        buildJourney({ status: "completed", acquired_knowledges: [{}] }),
        "pt"
      );

      expect(summary.status).toBe("completed");
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

  describe("getProfileSummary", () => {
    it("deve trazer o domínio do perfil, usado no texto das instruções", async () => {
      vi.spyOn(journeyProfileService, "getJourneyProfile").mockResolvedValueOnce({
        id: 5,
        name_pt: "Analista de Segurança da Informação",
        name_en: "Information Security Analyst",
        description_pt: null,
        description_en: null,
        type: 2,
      });

      await expect(getProfileSummary("5", "pt")).resolves.toMatchObject({
        id: null,
        profileId: "5",
        domain: "security",
        estimatedMinutes: null,
      });
    });

    it("deve deixar o domínio nulo quando o perfil não o informar", async () => {
      vi.spyOn(journeyProfileService, "getJourneyProfile").mockResolvedValueOnce({
        id: 6,
        name_pt: "Perfil sem domínio",
        name_en: "Profile without domain",
        description_pt: null,
        description_en: null,
        type: null,
      });

      await expect(getProfileSummary("6", "pt")).resolves.toMatchObject({ domain: null });
    });
  });

  describe("getLastProfileScore", () => {
    it("deve buscar a jornada concluída mais recente do perfil e devolver a nota", async () => {
      const spy = vi
        .spyOn(httpClient, "apiRequest")
        .mockResolvedValueOnce([{ id: 40, score: 81.6 }]);

      await expect(getLastProfileScore(2, "5")).resolves.toBe(82);
      expect(spy).toHaveBeenCalledWith(
        "/users/2/journeys",
        {
          params: { status: "completed", journey_profile_id: "5", page: 1, per_page: 1 },
        },
        expect.any(String)
      );
    });

    it.each([
      ["sem jornada concluída", () => Promise.resolve([])],
      ["sem nota na jornada", () => Promise.resolve([{ id: 40, score: null }])],
      ["com falha na busca", () => Promise.reject(new Error("boom"))],
    ])("deve devolver null %s", async (_, response) => {
      vi.spyOn(httpClient, "apiRequest").mockImplementationOnce(response);

      await expect(getLastProfileScore(2, "5")).resolves.toBeNull();
    });
  });
});
