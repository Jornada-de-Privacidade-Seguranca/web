import { describe, it, expect } from "vitest";
import {
  CURRENT_JOURNEY_BASE_PATH,
  getCompetenciesAreaUrl,
  getJourneyResultUrl,
  getJourneySummaryUrl,
  getProfileSummaryUrl,
  getAdminJourneyResultUrl,
  getAdminResultsUrl,
} from "../journeyRoutes";

describe("journeyRoutes utils", () => {
  describe("getCompetenciesAreaUrl", () => {
    it("deve montar a URL fixa de uma área do questionário de competências, sem id", () => {
      expect(CURRENT_JOURNEY_BASE_PATH).toBe("/jornada/atual");
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

  describe("rotas do resultado na visão do admin", () => {
    it("deve levar a query string da listagem ao resultado e de volta", () => {
      expect(getAdminJourneyResultUrl("78", "department=TI&page=2")).toBe(
        "/admin/resultados/78?department=TI&page=2"
      );
      expect(getAdminJourneyResultUrl("78", "?page=2")).toBe("/admin/resultados/78?page=2");
      expect(getAdminJourneyResultUrl("78")).toBe("/admin/resultados/78");
      expect(getAdminResultsUrl("domains=privacy&domains=joint")).toBe(
        "/admin/resultados?domains=privacy&domains=joint"
      );
      expect(getAdminResultsUrl("")).toBe("/admin/resultados");
    });
  });
});
