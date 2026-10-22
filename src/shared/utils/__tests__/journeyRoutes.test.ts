import { describe, it, expect } from "vitest";
import {
  CURRENT_JOURNEY_BASE_PATH,
  getCompetenciesAreaUrl,
  getCurrentJourneyStepUrl,
  getJourneySummaryUrl,
  getProfileSummaryUrl,
  getNextPreQuestionnaireStep,
  getPreviousPreQuestionnaireStep,
  PRE_QUESTIONNAIRE_STEPS,
} from "../journeyRoutes";

describe("journeyRoutes utils", () => {
  describe("getCurrentJourneyStepUrl", () => {
    it("deve montar a URL fixa da etapa da jornada em andamento, sem id", () => {
      expect(CURRENT_JOURNEY_BASE_PATH).toBe("/jornada/atual");
      expect(getCurrentJourneyStepUrl("tempo-atuacao-perfil")).toBe(
        "/jornada/atual/tempo-atuacao-perfil"
      );
      expect(getCurrentJourneyStepUrl("formacao-academica")).toBe(
        "/jornada/atual/formacao-academica"
      );
    });
  });

  describe("getCompetenciesAreaUrl", () => {
    it("deve montar a URL fixa de uma área do questionário de competências", () => {
      expect(getCompetenciesAreaUrl(0)).toBe("/jornada/atual/competencias/0");
      expect(getCompetenciesAreaUrl(3)).toBe("/jornada/atual/competencias/3");
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
