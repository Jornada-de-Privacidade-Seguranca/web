import { describe, it, expect } from "vitest";
import {
  CURRENT_JOURNEY_BASE_PATH,
  getCompetenciesAreaUrl,
  getJourneyResultUrl,
  getCompetenciesIntroUrl,
  getJourneySummaryUrl,
  getProfileSummaryUrl,
} from "../journeyRoutes";

describe("journeyRoutes utils", () => {
  describe("getCompetenciesIntroUrl", () => {
    it("deve montar a URL fixa das instruções de competências da jornada em andamento, sem id", () => {
      expect(CURRENT_JOURNEY_BASE_PATH).toBe("/jornada/atual");
      expect(getCompetenciesIntroUrl()).toBe("/jornada/atual/competencias");
    });
  });

  describe("getCompetenciesAreaUrl", () => {
    it("deve montar a URL fixa de uma área do questionário de competências", () => {
      expect(getCompetenciesAreaUrl(0)).toBe("/jornada/atual/competencias/0");
      expect(getCompetenciesAreaUrl(3)).toBe("/jornada/atual/competencias/3");
    });
  });

  describe("getJourneyResultUrl", () => {
    it("deve montar a URL do resultado de uma jornada concluída, com o id", () => {
      expect(getJourneyResultUrl("78")).toBe("/jornada/78/resultado");
    });
  });

  describe("getJourneySummaryUrl", () => {
    it("deve montar a URL do resumo de uma jornada criada", () => {
      expect(getJourneySummaryUrl("78")).toBe("/jornada/78");
    });
  });

  describe("getProfileSummaryUrl", () => {
    it("deve montar a URL do resumo de um perfil de jornada", () => {
      expect(getProfileSummaryUrl("4")).toBe("/jornada/perfil/4");
    });
  });
});
