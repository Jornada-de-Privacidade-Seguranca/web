import { describe, it, expect, vi, beforeEach } from "vitest";
import * as httpClient from "../httpClient";
import {
  finalizeCurrentJourney,
  getCompetencyOptions,
  getSavedCompetencies,
  saveCompetencies,
} from "../competenciesService";

const competency = {
  id: 12,
  origin_pt: null,
  origin_en: null,
  name_pt: "Mapeamento de dados pessoais",
  name_en: "Personal data mapping",
  description_pt: "Descrição",
  description_en: "Description",
  knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
  knowledge_area: { id: 3, name_pt: "Governança", name_en: "Governance" },
  difficulty: { id: 2, name_pt: "Básico", name_en: "Basic" },
};

const state = {
  journey_id: 10,
  status: "ongoing",
  is_complete: false,
  competencies: [{ id: 55, acquired: true, type_acquired: 1, competency }],
};

describe("competenciesService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar as competências do perfil da jornada em andamento", async () => {
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue([competency]);

    expect(await getCompetencyOptions()).toEqual([competency]);
    expect(spy).toHaveBeenCalledWith(
      "/journeys/current/competencies/options",
      {},
      expect.any(String)
    );
  });

  it("deve extrair as respostas salvas do estado da jornada", async () => {
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue(state);

    expect(await getSavedCompetencies()).toEqual(state.competencies);
    expect(spy).toHaveBeenCalledWith("/journeys/current/competencies", {}, expect.any(String));
  });

  it("deve retornar lista vazia quando o estado vier sem respostas", async () => {
    vi.spyOn(httpClient, "apiRequest").mockResolvedValue(null);

    expect(await getSavedCompetencies()).toEqual([]);
  });

  it("deve substituir as respostas com PUT e CSRF", async () => {
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue(state);
    const answers = [
      { competency_id: 12, acquired: true },
      { competency_id: 13, acquired: false },
    ];

    expect(await saveCompetencies(answers)).toEqual(state.competencies);
    expect(spy).toHaveBeenCalledWith(
      "/journeys/current/competencies",
      { method: "put", data: { competencies: answers }, withCsrf: true },
      expect.any(String)
    );
  });

  it("deve finalizar a jornada em andamento com POST e CSRF", async () => {
    const finalization = { journey_id: 10, status: "completed", finished_at: "2026-10-23 10:00:00" };
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue(finalization);

    expect(await finalizeCurrentJourney()).toEqual(finalization);
    expect(spy).toHaveBeenCalledWith(
      "/journeys/current/finalize",
      { method: "post", withCsrf: true },
      expect.any(String)
    );
  });
});
