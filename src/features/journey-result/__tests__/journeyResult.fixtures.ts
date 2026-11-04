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
    answers: {
      professional_experience: {
        id: 2,
        description_pt: "Entre 1 e 3 anos",
        description_en: "Between 1 and 3 years",
      },
      profile_experience: {
        id: 3,
        description_pt: "Entre 4 e 6 anos",
        description_en: "Between 4 and 6 years",
      },
      english_proficiency: null,
      higher_education_courses: [
        {
          id: 7,
          name_pt: "Segurança Cibernética",
          name_en: "Cybersecurity",
          subcriterion: { id: 3, name_pt: "Mestrado", name_en: "Master's" },
        },
        {
          id: 1,
          name_pt: "Ciência da Computação",
          name_en: "Computer Science",
          subcriterion: { id: 1, name_pt: "Graduação", name_en: "Graduation" },
        },
        {
          id: 2,
          name_pt: "Sistemas de Informação",
          name_en: "Information Systems",
          subcriterion: { id: 1, name_pt: "Graduação", name_en: "Graduation" },
        },
      ],
    },
    acquired_knowledges: [
      { id: 51, is_acquired: true, competency: c1 },
      { id: 52, is_acquired: false, competency: c2 },
      { id: 53, is_acquired: true, competency: c3 },
    ],
    professional_certifications: [
      { id: 1, name: "CIPP/E", knowledge_domain: privacy },
    ],
    ...overrides,
  };
}
