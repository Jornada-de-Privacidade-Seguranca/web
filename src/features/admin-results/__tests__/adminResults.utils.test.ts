import { describe, it, expect } from "vitest";
import {
  formatAdminResultDate,
  getScoreBadgeClasses,
  parseAdminResultsSearchParams,
  serializeAdminResultsSearchParams,
} from "../adminResults.utils";

describe("adminResults.utils", () => {
  describe("parseAdminResultsSearchParams / serializeAdminResultsSearchParams", () => {
    it("deve extrair userId, múltiplos domínios, datas, busca e página da URL", () => {
      const params = new URLSearchParams(
        "userId=1&department=Jur%C3%ADdico&domains=privacy,security,invalido&journeyProfileId=2&dateFrom=2026-05-01&dateTo=2026-05-31&search=ana&page=2"
      );

      const parsed = parseAdminResultsSearchParams(params);

      expect(parsed.page).toBe(2);
      expect(parsed.filters).toEqual({
        search: "ana",
        userId: "1",
        department: "Jurídico",
        domains: ["privacy", "security"],
        journeyProfileId: "2",
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
      });
    });

    it("deve voltar para página 1 se o parâmetro page for inválido", () => {
      const parsed = parseAdminResultsSearchParams(new URLSearchParams("page=-3"));
      expect(parsed.page).toBe(1);
    });

    it("deve serializar filtros ativos omitindo campos vazios e página 1", () => {
      const qs = serializeAdminResultsSearchParams(
        {
          search: "  carlos ",
          userId: "2",
          department: "",
          domains: ["privacy", "joint"],
          journeyProfileId: "",
          dateFrom: "2026-04-01",
          dateTo: "",
        },
        1
      );

      expect(qs).toBe("search=carlos&userId=2&domains=privacy%2Cjoint&dateFrom=2026-04-01");

      const qsWithPage = serializeAdminResultsSearchParams(
        {
          search: "",
          userId: "2",
          department: "",
          domains: [],
          journeyProfileId: "",
          dateFrom: "",
          dateTo: "",
        },
        3
      );
      expect(qsWithPage).toBe("userId=2&page=3");
    });
  });

  describe("getScoreBadgeClasses / formatAdminResultDate", () => {
    it("deve retornar estilos distintos por faixa de nota", () => {
      expect(getScoreBadgeClasses("strong")).toContain("emerald");
      expect(getScoreBadgeClasses("medium")).toContain("amber");
      expect(getScoreBadgeClasses("weak")).toContain("destructive");
    });

    it("deve formatar data ISO em PT e EN", () => {
      expect(formatAdminResultDate("2026-05-15T10:00:00Z", "pt")).toBe("15/05/2026");
      expect(formatAdminResultDate("2026-05-15T10:00:00Z", "en")).toBe("05/15/2026");
    });
  });
});

