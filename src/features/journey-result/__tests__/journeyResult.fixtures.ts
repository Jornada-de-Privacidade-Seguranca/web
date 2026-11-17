import type {
  JourneyResultApi,
  JourneyResultCompetencyApi,
} from "../journeyResult.types";

const privacy = { id: 1, name_pt: "Privacidade", name_en: "Privacy" };
const security = { id: 2, name_pt: "Segurança da Informação", name_en: "Information Security" };
const governance = { id: 1, name_pt: "Governança", name_en: "Governance" };
const cryptography = { id: 2, name_pt: "Criptografia", name_en: "Cryptography" };

export function buildCompetency(
  overrides: Partial<JourneyResultCompetencyApi> & { id: number }
): JourneyResultCompetencyApi {
  return {
    name_pt: `Competência ${overrides.id}`,
    name_en: `Competency ${overrides.id}`,
    description_pt: `Descrição ${overrides.id}`,
    description_en: `Description ${overrides.id}`,
    knowledge_domain: privacy,
    knowledge_area: governance,
    difficulty: { id: 2, name_pt: "Básico", name_en: "Basic" },
    ...overrides,
  };
}

/**
 * Jornada conjunta concluída:
 * - Governança (Privacidade): competência 1 "Sim" e 2 "Não";
 * - Criptografia (Segurança): competência 3 "Sim";
 * - sem área (Segurança): competência 4 sem resposta.
 */
export const c1 = buildCompetency({ id: 1 });
export const c2 = buildCompetency({ id: 2 });
export const c3 = buildCompetency({
  id: 3,
  knowledge_domain: security,
  knowledge_area: cryptography,
  difficulty: { id: 4, name_pt: "Avançado", name_en: "Advanced" },
});
export const c4 = buildCompetency({
  id: 4,
  knowledge_domain: security,
  knowledge_area: null,
  difficulty: null,
});

export function buildJourney(overrides: Partial<JourneyResultApi> = {}): JourneyResultApi {
  return {
    id: 10,
    user: {
      id: 4,
      name: "Ana Beatriz Silva",
      email: "ana@empresa.gov.br",
      organization: "Ministério X",
      sector: "Jurídico",
      registration: null,
    },
    journey_profile: {
      id: 2,
      name_pt: "Encarregado de Dados",
      name_en: "Data Protection Officer",
      knowledge_domain: { id: 3, name_pt: "Conjunta", name_en: "Joint" },
      competencies: [c4, c3, c2, c1],
    },
    status: "completed",
    finished_at: "2026-10-14 16:30:00",
    score: 76.4,
    acquired_knowledges: [
      { id: 51, is_acquired: true, competency: c1 },
      { id: 52, is_acquired: false, competency: c2 },
      { id: 53, is_acquired: true, competency: c3 },
    ],
    ...overrides,
  };
}
