import { describe, it, expect } from "vitest";
import {
  getJourneyRoutePrefix,
  getJourneyStepUrl,
  getJourneySummaryUrl,
  formatJourneyTitleFromSlug,
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
});
