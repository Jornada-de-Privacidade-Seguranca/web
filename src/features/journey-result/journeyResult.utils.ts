import { resolveDifficultyLevel } from "@shared/utils/difficultyLevel";
import { normalizeScore, resolveScoreBand } from "@shared/utils/scoreBand";
import type {
  AreaScore,
  AreaScoreGroup,
  CategoryScore,
  CompetencyAreaBucket,
  CompetencyAreaGroup,
  CompetencyResultItem,
  CourseLevelGroup,
  JourneyResultApi,
  JourneyResultCompetencyApi,
  JourneyResultFormatters,
  JourneyResultModel,
  ProfessionalProfileSummary,
  ScoreValue,
} from "./journeyResult.types";

/** Área das competências sem área de conhecimento (sempre a última). */
const OTHER_AREA_ID = "other";
const OTHER_GROUP_ID = "other";

export function buildScoreValue(
  score: number | null | undefined,
  bandLabel: JourneyResultFormatters["bandLabel"]
): ScoreValue {
  const value = normalizeScore(score);
  const band = resolveScoreBand(value);
  return { value, band, bandLabel: bandLabel(band) };
}

/**
 * Competências avaliadas: as do perfil e, como no backend, as respondidas que
 * não estejam mais no perfil. Cada competência aparece uma única vez.
 */
export function collectCompetencies(journey: JourneyResultApi): JourneyResultCompetencyApi[] {
  const byId = new Map<number, JourneyResultCompetencyApi>();
  for (const competency of journey.journey_profile?.competencies ?? []) {
    byId.set(competency.id, competency);
  }
  for (const knowledge of journey.acquired_knowledges ?? []) {
    if (knowledge.competency && !byId.has(knowledge.competency.id)) {
      byId.set(knowledge.competency.id, knowledge.competency);
    }
  }
  return [...byId.values()];
}

/** Competências marcadas como "Sim", pelo id da competência. */
export function collectDeclaredIds(journey: JourneyResultApi): Set<number> {
  const declared = new Set<number>();
  for (const knowledge of journey.acquired_knowledges ?? []) {
    if (knowledge.is_acquired && knowledge.competency) {
      declared.add(knowledge.competency.id);
    }
  }
  return declared;
}

/**
 * Agrupa as competências por área de conhecimento, ordenadas pelo id da área
 * (a mesma regra do questionário). Competências sem área ficam por último.
 */
export function groupCompetenciesByArea(
  competencies: JourneyResultCompetencyApi[],
  formatters: Pick<JourneyResultFormatters, "localize" | "otherAreaLabel">
): CompetencyAreaBucket[] {
  const byArea = new Map<string, CompetencyAreaBucket>();

  for (const competency of competencies) {
    const area = competency.knowledge_area;
    const areaId = area ? String(area.id) : OTHER_AREA_ID;
    let bucket = byArea.get(areaId);
    if (!bucket) {
      bucket = {
        id: areaId,
        sortId: area ? area.id : Number.POSITIVE_INFINITY,
        name: area ? formatters.localize(area.name_pt, area.name_en) : formatters.otherAreaLabel,
        domainId: null,
        domainName: null,
        competencies: [],
      };
      byArea.set(areaId, bucket);
    }
    // O domínio da área é o das suas competências
    if (bucket.domainId === null && competency.knowledge_domain) {
      bucket.domainId = competency.knowledge_domain.id;
      bucket.domainName = formatters.localize(
        competency.knowledge_domain.name_pt,
        competency.knowledge_domain.name_en
      );
    }
    bucket.competencies.push(competency);
  }

  return [...byArea.values()].sort((a, b) => a.sortId - b.sortId);
}

/** Percentual de competências da área marcadas como "Sim", arredondado. */
export function calculateAreaScore(
  competencies: JourneyResultCompetencyApi[],
  declaredIds: Set<number>
): { declaredCount: number; totalCount: number; score: number } {
  const totalCount = competencies.length;
  const declaredCount = competencies.filter((c) => declaredIds.has(c.id)).length;
  const score = totalCount > 0 ? Math.round((declaredCount / totalCount) * 100) : 0;
  return { declaredCount, totalCount, score };
}

function toAreaScore(
  bucket: CompetencyAreaBucket,
  declaredIds: Set<number>,
  formatters: JourneyResultFormatters
): AreaScore {
  const { declaredCount, totalCount, score } = calculateAreaScore(bucket.competencies, declaredIds);
  const scoreValue = buildScoreValue(score, formatters.bandLabel);
  return {
    id: bucket.id,
    name: bucket.name,
    score: scoreValue,
    scoreAriaLabel: formatters.scoreAriaLabel(bucket.name, scoreValue),
    declaredCount,
    totalCount,
    countText: formatters.areaCountText(declaredCount, totalCount),
  };
}

/**
 * Notas por área. Em jornadas conjuntas, as áreas são divididas pelo domínio
 * das suas competências (Privacidade e Segurança da Informação), em ordem de
 * id do domínio; nas demais, formam um único grupo sem título.
 */
export function buildAreaScoreGroups(
  buckets: CompetencyAreaBucket[],
  declaredIds: Set<number>,
  isJointJourney: boolean,
  formatters: JourneyResultFormatters
): AreaScoreGroup[] {
  if (!isJointJourney) {
    return [
      {
        id: "all",
        title: null,
        areas: buckets.map((bucket) => toAreaScore(bucket, declaredIds, formatters)),
      },
    ];
  }

  const byDomain = new Map<string, AreaScoreGroup & { sortId: number }>();
  for (const bucket of buckets) {
    const groupId = bucket.domainId !== null ? String(bucket.domainId) : OTHER_GROUP_ID;
    let group = byDomain.get(groupId);
    if (!group) {
      group = {
        id: groupId,
        sortId: bucket.domainId ?? Number.POSITIVE_INFINITY,
        title: bucket.domainName || formatters.otherDomainLabel,
        areas: [],
      };
      byDomain.set(groupId, group);
    }
    group.areas.push(toAreaScore(bucket, declaredIds, formatters));
  }

  return [...byDomain.values()]
    .sort((a, b) => a.sortId - b.sortId)
    .map(({ id, title, areas }) => ({ id, title, areas }));
}

function toCompetencyResultItem(
  competency: JourneyResultCompetencyApi,
  formatters: JourneyResultFormatters
): CompetencyResultItem {
  const { localize } = formatters;
  const difficulty = competency.difficulty;
  const domain = competency.knowledge_domain;
  return {
    id: competency.id,
    name: localize(competency.name_pt, competency.name_en),
    description: localize(competency.description_pt, competency.description_en),
    difficulty: difficulty
      ? {
          level: resolveDifficultyLevel(difficulty.name_pt, difficulty.name_en),
          label: localize(difficulty.name_pt, difficulty.name_en),
        }
      : null,
    domain: domain ? localize(domain.name_pt, domain.name_en) || null : null,
  };
}

/**
 * Competências de uma das caixas, agrupadas por área. Competências sem
 * resposta contam como não declaradas. Áreas sem competências na caixa não
 * aparecem.
 */
export function buildCompetencyAreaGroups(
  buckets: CompetencyAreaBucket[],
  declaredIds: Set<number>,
  declared: boolean,
  formatters: JourneyResultFormatters
): CompetencyAreaGroup[] {
  return buckets
    .map((bucket) => {
      const competencies = bucket.competencies
        .filter((competency) => declaredIds.has(competency.id) === declared)
        .map((competency) => toCompetencyResultItem(competency, formatters));
      return {
        id: bucket.id,
        name: bucket.name,
        countText: formatters.groupCountText(competencies.length),
        competencies,
      };
    })
    .filter((group) => group.competencies.length > 0);
}

/** Cursos agrupados por nível (subcritério), em ordem de id do nível. */
function buildCourseGroups(
  journey: JourneyResultApi,
  formatters: JourneyResultFormatters
): CourseLevelGroup[] {
  const byLevel = new Map<string, CourseLevelGroup & { sortId: number }>();
  for (const course of journey.answers?.higher_education_courses ?? []) {
    const level = course.subcriterion;
    const levelId = level ? String(level.id) : OTHER_GROUP_ID;
    let group = byLevel.get(levelId);
    if (!group) {
      group = {
        id: levelId,
        sortId: level ? level.id : Number.POSITIVE_INFINITY,
        name: level ? formatters.localize(level.name_pt, level.name_en) : formatters.otherCoursesLabel,
        courses: [],
      };
      byLevel.set(levelId, group);
    }
    group.courses.push({ id: course.id, name: formatters.localize(course.name_pt, course.name_en) });
  }

  return [...byLevel.values()]
    .sort((a, b) => a.sortId - b.sortId)
    .map(({ id, name, courses }) => ({ id, name, courses }));
}

export function buildProfessionalProfile(
  journey: JourneyResultApi,
  formatters: JourneyResultFormatters
): ProfessionalProfileSummary {
  const { localize, notProvided, fieldLabels } = formatters;
  const answers = journey.answers;
  const professional = answers?.professional_experience;
  const english = answers?.english_proficiency;
  const profile = answers?.profile_experience;

  return {
    fields: [
      {
        id: "professional_experience",
        label: fieldLabels.professional_experience,
        value: (professional && localize(professional.description_pt, professional.description_en)) || notProvided,
      },
      {
        id: "english_proficiency",
        label: fieldLabels.english_proficiency,
        value: (english && localize(english.name_pt, english.name_en)) || notProvided,
      },
      {
        id: "profile_experience",
        label: fieldLabels.profile_experience,
        value: (profile && localize(profile.description_pt, profile.description_en)) || notProvided,
      },
    ],
    courseGroups: buildCourseGroups(journey, formatters),
    // O nome da certificação é único e aparece igual nos dois idiomas
    certifications: (journey.professional_certifications ?? [])
      .filter((certification) => Boolean(certification.name))
      .map((certification) => ({ id: certification.id, name: certification.name ?? "" })),
  };
}

/** Pontuação por categoria; null enquanto o backend não retornar `score_breakdown`. */
export function buildCategoryScores(
  journey: JourneyResultApi,
  formatters: JourneyResultFormatters
): CategoryScore[] | null {
  const breakdown = journey.score_breakdown;
  if (!Array.isArray(breakdown) || breakdown.length === 0) return null;

  return breakdown.map((item) => {
    const name = formatters.localize(item.name_pt, item.name_en) || item.category;
    const score = buildScoreValue(item.score, formatters.bandLabel);
    return {
      id: item.category,
      name,
      score,
      scoreAriaLabel: formatters.scoreAriaLabel(name, score),
    };
  });
}

/**
 * A jornada é conjunta quando as competências avaliadas são de mais de um
 * domínio, sem depender do id do domínio do perfil no banco.
 */
export function isJointJourney(competencies: JourneyResultCompetencyApi[]): boolean {
  const domainIds = new Set<number>();
  for (const competency of competencies) {
    if (competency.knowledge_domain) domainIds.add(competency.knowledge_domain.id);
  }
  return domainIds.size > 1;
}

/** Monta todos os dados da tela a partir da jornada concluída. */
export function buildJourneyResultModel(
  journey: JourneyResultApi,
  formatters: JourneyResultFormatters
): JourneyResultModel {
  const profile = journey.journey_profile;
  const competencies = collectCompetencies(journey);
  const declaredIds = collectDeclaredIds(journey);
  const buckets = groupCompetenciesByArea(competencies, formatters);
  const isJoint = isJointJourney(competencies);

  return {
    journeyTitle: profile ? formatters.localize(profile.name_pt, profile.name_en) : "",
    score: buildScoreValue(journey.score, formatters.bandLabel),
    declaredCount: competencies.filter((competency) => declaredIds.has(competency.id)).length,
    totalCompetencies: competencies.length,
    categoryScores: buildCategoryScores(journey, formatters),
    isJointJourney: isJoint,
    areaScoreGroups: buildAreaScoreGroups(buckets, declaredIds, isJoint, formatters),
    professionalProfile: buildProfessionalProfile(journey, formatters),
    declaredCompetencies: buildCompetencyAreaGroups(buckets, declaredIds, true, formatters),
    undeclaredCompetencies: buildCompetencyAreaGroups(buckets, declaredIds, false, formatters),
  };
}
