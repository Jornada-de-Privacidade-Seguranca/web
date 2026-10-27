import { describe, it, expect } from "vitest";
import {
  buildCategoryScores,
  buildJourneyResultModel,
  buildScoreValue,
  calculateAreaScore,
  collectCompetencies,
} from "../journeyResult.utils";
import type { JourneyResultFormatters } from "../journeyResult.types";
import { buildCompetency, buildJourney, c1, c2, c3 } from "./journeyResult.fixtures";

const BAND_LABELS = { strong: "Forte", medium: "Médio", weak: "A desenvolver" } as const;

const formatters: JourneyResultFormatters = {
  localize: (pt, en) => pt || en || "",
  bandLabel: (band) => BAND_LABELS[band],
  scoreAriaLabel: (name, score) => `${name}: ${score.bandLabel}, ${score.value} de 100`,
  areaCountText: (declared, total) => `${declared} de ${total} competências`,
  groupCountText: (count) => `${count} competências`,
  otherAreaLabel: "Outras competências",
  otherDomainLabel: "Outros domínios",
  otherCoursesLabel: "Outros cursos",
  notProvided: "Não informado",
  fieldLabels: {
    professional_experience: "Tempo de experiência profissional",
    english_proficiency: "Nível de proficiência em inglês",
    profile_experience: "Tempo de atuação no perfil",
  },
};

describe("journeyResult.utils", () => {
  describe("buildScoreValue", () => {
    it.each([
      [76.4, 76, "strong"],
      [75, 75, "strong"],
      [74.6, 75, "strong"],
      [74.4, 74, "medium"],
      [60, 60, "medium"],
      [59.4, 59, "weak"],
      [0, 0, "weak"],
    ] as const)("deve arredondar %s para %s na faixa %s", (score, value, band) => {
      expect(buildScoreValue(score, formatters.bandLabel)).toEqual({
        value,
        band,
        bandLabel: BAND_LABELS[band],
      });
    });

    it("deve tratar nota ausente como zero", () => {
      expect(buildScoreValue(null, formatters.bandLabel).value).toBe(0);
    });
  });

  describe("calculateAreaScore", () => {
    it("deve calcular o percentual de competências declaradas da área", () => {
      expect(calculateAreaScore([c1, c2, c3], new Set([1, 3]))).toEqual({
        declaredCount: 2,
        totalCount: 3,
        score: 67,
      });
    });

    it("deve permitir nota zero e área vazia", () => {
      expect(calculateAreaScore([c2], new Set()).score).toBe(0);
      expect(calculateAreaScore([], new Set()).score).toBe(0);
    });
  });

  describe("collectCompetencies", () => {
    it("deve incluir as respondidas que não estão no perfil, sem repetir competências", () => {
      const extra = buildCompetency({ id: 99 });
      const journey = buildJourney();
      journey.acquired_knowledges.push({ id: 60, is_acquired: true, competency: extra });

      const ids = collectCompetencies(journey).map((competency) => competency.id);

      expect(ids).toEqual([4, 3, 2, 1, 99]);
    });
  });

  describe("buildJourneyResultModel", () => {
    const model = buildJourneyResultModel(buildJourney(), formatters);

    it("deve montar a nota geral e o total de competências declaradas", () => {
      expect(model.journeyTitle).toBe("Encarregado de Dados");
      expect(model.score).toEqual({ value: 76, band: "strong", bandLabel: "Forte" });
      expect(model.declaredCount).toBe(2);
      expect(model.totalCompetencies).toBe(4);
    });

    it("deve dividir as áreas por domínio em jornadas conjuntas, ordenadas pelo id", () => {
      expect(model.isJointJourney).toBe(true);
      expect(
        model.areaScoreGroups.map((group) => ({
          title: group.title,
          areas: group.areas.map((area) => [area.name, area.score.value, area.countText]),
        }))
      ).toEqual([
        { title: "Privacidade", areas: [["Governança", 50, "1 de 2 competências"]] },
        {
          title: "Segurança da Informação",
          areas: [
            ["Criptografia", 100, "1 de 1 competências"],
            ["Outras competências", 0, "0 de 1 competências"],
          ],
        },
      ]);
    });

    it("deve gerar o rótulo acessível da nota de cada área", () => {
      expect(model.areaScoreGroups[0].areas[0].scoreAriaLabel).toBe(
        "Governança: A desenvolver, 50 de 100"
      );
    });

    it("deve formar um único grupo sem título em jornadas de um só domínio", () => {
      const journey = buildJourney();
      journey.journey_profile!.knowledge_domain = { id: 1, name_pt: "Privacidade", name_en: "Privacy" };

      const groups = buildJourneyResultModel(journey, formatters).areaScoreGroups;

      expect(groups).toHaveLength(1);
      expect(groups[0].title).toBeNull();
      expect(groups[0].areas.map((area) => area.name)).toEqual([
        "Governança",
        "Criptografia",
        "Outras competências",
      ]);
    });

    it("deve separar competências declaradas e não declaradas por área", () => {
      const summarize = (groups: typeof model.declaredCompetencies) =>
        groups.map((group) => [group.name, group.competencies.map((c) => c.id)]);

      expect(summarize(model.declaredCompetencies)).toEqual([
        ["Governança", [1]],
        ["Criptografia", [3]],
      ]);
      // A competência 4, sem resposta, conta como não declarada
      expect(summarize(model.undeclaredCompetencies)).toEqual([
        ["Governança", [2]],
        ["Outras competências", [4]],
      ]);
    });

    it("deve preparar o nível e o domínio de cada competência", () => {
      const [crypto] = model.declaredCompetencies[1].competencies;
      expect(crypto.difficulty).toEqual({ level: "advanced", label: "Avançado" });
      expect(crypto.domain).toBe("Segurança da Informação");

      const [withoutArea] = model.undeclaredCompetencies[1].competencies;
      expect(withoutArea.difficulty).toBeNull();
    });

    it("deve resumir o perfil profissional, com 'Não informado' nos itens ausentes", () => {
      expect(model.professionalProfile.fields.map((field) => field.value)).toEqual([
        "Entre 1 e 3 anos",
        "Não informado",
        "Entre 4 e 6 anos",
      ]);
      expect(
        model.professionalProfile.courseGroups.map((group) => [
          group.name,
          group.courses.map((course) => course.name),
        ])
      ).toEqual([
        ["Graduação", ["Ciência da Computação", "Sistemas de Informação"]],
        ["Mestrado", ["Segurança Cibernética"]],
      ]);
      expect(model.professionalProfile.certifications).toEqual([{ id: 1, name: "CIPP/E" }]);
    });

    it("deve usar os nomes em inglês quando o idioma for EN", () => {
      const english = buildJourneyResultModel(buildJourney(), {
        ...formatters,
        localize: (pt, en) => en || pt || "",
      });

      expect(english.journeyTitle).toBe("Data Protection Officer");
      expect(english.areaScoreGroups[0].title).toBe("Privacy");
      expect(english.professionalProfile.fields[0].value).toBe("Between 1 and 3 years");
    });
  });

  describe("buildCategoryScores", () => {
    it("deve retornar null enquanto o backend não enviar score_breakdown", () => {
      expect(buildCategoryScores(buildJourney(), formatters)).toBeNull();
      expect(buildCategoryScores(buildJourney({ score_breakdown: [] }), formatters)).toBeNull();
    });

    it("deve montar a nota de cada categoria", () => {
      const journey = buildJourney({
        score_breakdown: [
          {
            category: "professional_experience",
            name_pt: "Experiência profissional",
            name_en: "Professional experience",
            score: 66.7,
          },
        ],
      });

      expect(buildCategoryScores(journey, formatters)).toEqual([
        {
          id: "professional_experience",
          name: "Experiência profissional",
          score: { value: 67, band: "medium", bandLabel: "Médio" },
          scoreAriaLabel: "Experiência profissional: Médio, 67 de 100",
        },
      ]);
    });
  });
});
