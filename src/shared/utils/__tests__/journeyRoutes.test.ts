import { describe, it, expect } from "vitest";
import {
  getJourneyRoutePrefix,
  getJourneyStepUrl,
  getJourneySummaryUrl,
  formatJourneyTitleFromSlug,
  getNextPreQuestionnaireStep,
  getPreviousPreQuestionnaireStep,
  PRE_QUESTIONNAIRE_STEPS,
} from "../journeyRoutes";

describe("journeyRoutes utils", () => {
  describe("getJourneyRoutePrefix", () => {
    it("deve retornar 'jornada' quando o pathname inicia com /jornada", () => {
      expect(getJourneyRoutePrefix("/jornada/123/english")).toBe("jornada");
      expect(getJourneyRoutePrefix("/jornada/slug")).toBe("jornada");
    });

    it("deve retornar 'journey' quando o pathname inicia com /journey ou outro caminho", () => {
      expect(getJourneyRoutePrefix("/journey/123/english")).toBe("journey");
      expect(getJourneyRoutePrefix("/en/journey/123")).toBe("journey");
      expect(getJourneyRoutePrefix(null)).toBe("journey");
      expect(getJourneyRoutePrefix(undefined)).toBe("journey");
    });
  });

  describe("getJourneyStepUrl", () => {
    it("deve montar corretamente a URL da etapa para prefixo jornada", () => {
      expect(
        getJourneyStepUrl("jornada", "data-governance", "tempo-atuacao-perfil")
      ).toBe("/jornada/data-governance/tempo-atuacao-perfil");
    });

    it("deve montar corretamente a URL da etapa para prefixo journey", () => {
      expect(
        getJourneyStepUrl("journey", "data-governance", "tempo-atuacao-perfil")
      ).toBe("/journey/data-governance/tempo-atuacao-perfil");
    });
  });

  describe("getJourneySummaryUrl", () => {
    it("deve montar a URL do sumário da jornada", () => {
      expect(getJourneySummaryUrl("jornada", "data-governance")).toBe(
        "/jornada/data-governance"
      );
      expect(getJourneySummaryUrl("journey", "data-governance")).toBe(
        "/journey/data-governance"
      );
    });
  });

  describe("formatJourneyTitleFromSlug", () => {
    it("deve formatar slugs em Title Case", () => {
      expect(formatJourneyTitleFromSlug("data-governance")).toBe(
        "Data Governance"
      );
      expect(formatJourneyTitleFromSlug("lgpd-basics")).toBe("Lgpd Basics");
      expect(formatJourneyTitleFromSlug("seguranca-da-informacao")).toBe(
        "Seguranca Da Informacao"
      );
    });
  });

  describe("PRE_QUESTIONNAIRE_STEPS", () => {
    it("deve conter a sequência de etapas correta da jornada", () => {
      expect(PRE_QUESTIONNAIRE_STEPS).toEqual([
        "experiencia-profissional",
        "english",
        "tempo-atuacao-perfil",
        "formacao-academica",
        "certificacoes-profissionais",
        "competencias",
      ]);
    });
  });

  describe("getNextPreQuestionnaireStep", () => {
    it("deve retornar a etapa seguinte da sequência", () => {
      expect(getNextPreQuestionnaireStep("english")).toBe("tempo-atuacao-perfil");
      expect(getNextPreQuestionnaireStep("tempo-atuacao-perfil")).toBe(
        "formacao-academica"
      );
    });

    it("deve retornar null para a última etapa", () => {
      expect(getNextPreQuestionnaireStep("competencias")).toBeNull();
    });
  });

  describe("getPreviousPreQuestionnaireStep", () => {
    it("deve retornar a etapa anterior da sequência", () => {
      expect(getPreviousPreQuestionnaireStep("tempo-atuacao-perfil")).toBe(
        "english"
      );
    });

    it("deve retornar null para a primeira etapa", () => {
      expect(
        getPreviousPreQuestionnaireStep("experiencia-profissional")
      ).toBeNull();
    });
  });
});
