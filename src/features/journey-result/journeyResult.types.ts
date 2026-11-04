import type { ScoreBand } from "@shared/utils/scoreBand";
import type { DifficultyLevel } from "@shared/utils/difficultyLevel";

// ---- Contrato da API (GET /journeys/{journey}) ----

export interface JourneyResultNamedApi {
  id: number;
  name_pt: string | null;
  name_en: string | null;
}

export interface JourneyResultCompetencyApi {
  id: number;
  name_pt: string | null;
  name_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  knowledge_domain: JourneyResultNamedApi | null;
  knowledge_area: JourneyResultNamedApi | null;
  difficulty: JourneyResultNamedApi | null;
}

export interface JourneyResultProfileApi {
  id: number | null;
  name_pt: string | null;
  name_en: string | null;
  knowledge_domain: JourneyResultNamedApi | null;
  competencies: JourneyResultCompetencyApi[];
}

/** Resposta de tempo de experiência (profissional ou no perfil). */
export interface JourneyResultExperienceApi {
  id: number;
  description_pt: string | null;
  description_en: string | null;
}

export interface JourneyResultCourseApi {
  id: number;
  name_pt: string | null;
  name_en: string | null;
  /** Nível do curso (Graduação, Pós-graduação, Mestrado, Doutorado) */
  subcriterion: JourneyResultNamedApi | null;
}

export interface JourneyResultAnswersApi {
  professional_experience: JourneyResultExperienceApi | null;
  profile_experience: JourneyResultExperienceApi | null;
  english_proficiency: JourneyResultNamedApi | null;
  higher_education_courses: JourneyResultCourseApi[];
}

export interface JourneyResultAcquiredKnowledgeApi {
  id: number;
  is_acquired: boolean;
  competency: JourneyResultCompetencyApi | null;
}

export interface JourneyResultCertificationApi {
  id: number;
  name: string | null;
  knowledge_domain: JourneyResultNamedApi | null;
}

/** Proposta de detalhamento da nota por categoria; ainda não retornada pelo backend. */
export interface JourneyResultScoreBreakdownApi {
  category: string;
  name_pt: string | null;
  name_en: string | null;
  score: number;
}

export interface JourneyResultApi {
  id: number;
  journey_profile: JourneyResultProfileApi | null;
  status: "ongoing" | "completed";
  finished_at: string | null;
  score: number | null;
  answers: JourneyResultAnswersApi;
  acquired_knowledges: JourneyResultAcquiredKnowledgeApi[];
  professional_certifications: JourneyResultCertificationApi[];
  score_breakdown?: JourneyResultScoreBreakdownApi[] | null;
}

/** Erros da requisição; "not_completed" é derivado do status da jornada. */
export type JourneyResultRequestErrorType =
  | "not_found"
  | "forbidden"
  | "incomplete"
  | "server_error";

export type JourneyResultErrorType = JourneyResultRequestErrorType | "not_completed";

// ---- Modelo da tela ----

export interface ScoreValue {
  /** Nota de 0 a 100, arredondada */
  value: number;
  band: ScoreBand;
  /** Rótulo da faixa, conforme o idioma (ex.: "Forte") */
  bandLabel: string;
}

export interface CategoryScore {
  id: string;
  name: string;
  score: ScoreValue;
  scoreAriaLabel: string;
}

export interface AreaScore {
  /** id da área de conhecimento, ou "other" para competências sem área */
  id: string;
  name: string;
  score: ScoreValue;
  scoreAriaLabel: string;
  declaredCount: number;
  totalCount: number;
  countText: string;
}

export interface AreaScoreGroup {
  id: string;
  /** Nome do domínio em jornadas conjuntas; null quando há um único grupo */
  title: string | null;
  areas: AreaScore[];
}

export interface ProfessionalProfileField {
  id: "professional_experience" | "english_proficiency" | "profile_experience";
  label: string;
  value: string;
}

export interface NamedChip {
  id: number;
  name: string;
}

export interface CourseLevelGroup {
  id: string;
  name: string;
  courses: NamedChip[];
}

export interface ProfessionalProfileSummary {
  fields: ProfessionalProfileField[];
  courseGroups: CourseLevelGroup[];
  certifications: NamedChip[];
}

export interface CompetencyResultDifficulty {
  level: DifficultyLevel | null;
  label: string;
}

export interface CompetencyResultItem {
  id: number;
  name: string;
  description: string;
  difficulty: CompetencyResultDifficulty | null;
  /** Nome do domínio conforme o idioma; null não exibe o badge */
  domain: string | null;
}

export interface CompetencyAreaGroup {
  id: string;
  name: string;
  countText: string;
  competencies: CompetencyResultItem[];
}

/** Competências de uma área, antes do cálculo da nota e da divisão em caixas. */
export interface CompetencyAreaBucket {
  id: string;
  /** Ordem da área: id da área de conhecimento; "Outras competências" fica por último */
  sortId: number;
  name: string;
  /** Domínio das competências da área (uma área não mistura domínios) */
  domainId: number | null;
  domainName: string | null;
  competencies: JourneyResultCompetencyApi[];
}

/** Textos e formatação que dependem do idioma, injetados no montador do modelo. */
export interface JourneyResultFormatters {
  localize: (pt?: string | null, en?: string | null) => string;
  bandLabel: (band: ScoreBand) => string;
  scoreAriaLabel: (name: string, score: ScoreValue) => string;
  areaCountText: (declared: number, total: number) => string;
  groupCountText: (count: number) => string;
  otherAreaLabel: string;
  otherDomainLabel: string;
  otherCoursesLabel: string;
  notProvided: string;
  fieldLabels: Record<ProfessionalProfileField["id"], string>;
}

/** Dados da tela derivados da jornada, sem estado de carregamento ou erro. */
export interface JourneyResultModel {
  journeyTitle: string;
  score: ScoreValue;
  declaredCount: number;
  totalCompetencies: number;
  categoryScores: CategoryScore[] | null;
  isJointJourney: boolean;
  areaScoreGroups: AreaScoreGroup[];
  professionalProfile: ProfessionalProfileSummary;
  declaredCompetencies: CompetencyAreaGroup[];
  undeclaredCompetencies: CompetencyAreaGroup[];
}

export interface JourneyResultLabels {
  pageTitle: string;
  loadingAriaLabel: string;
  overallLabel: string;
  overallScoreAriaLabel: string;
  declaredCountText: string;
  retakeButton: string;
  backButton: string;
  categories: {
    eyebrow: string;
    title: string;
  };
  areas: {
    eyebrow: string;
    title: string;
    recommendation: string;
    markerAriaLabel: string;
  };
  profile: {
    eyebrow: string;
    title: string;
    coursesTitle: string;
    certificationsTitle: string;
    noCourses: string;
    noCertifications: string;
  };
  competencies: {
    eyebrow: string;
    declaredTitle: string;
    undeclaredTitle: string;
    emptyGroup: string;
    difficultyPrefix: string;
    domainPrefix: string;
  };
  errors: JourneyResultErrorLabels | null;
}

export interface JourneyResultErrorLabels {
  title: string;
  message: string;
  linkText: string;
  linkHref: string;
  /** Texto do botão de nova tentativa; null quando o erro não se resolve tentando de novo */
  retryButton: string | null;
}

/** Função de tradução do namespace "journeyResult". */
export type JourneyResultTranslate = (key: string) => string;

export interface JourneyResultViewModelReturn {
  journeyTitle: string;
  score: ScoreValue;
  declaredCount: number;
  totalCompetencies: number;
  /** null enquanto o backend não retornar o detalhamento por categoria */
  categoryScores: CategoryScore[] | null;
  isJointJourney: boolean;
  areaScoreGroups: AreaScoreGroup[];
  professionalProfile: ProfessionalProfileSummary;
  declaredCompetencies: CompetencyAreaGroup[];
  undeclaredCompetencies: CompetencyAreaGroup[];
  retakeUrl: string;
  resultsUrl: string;
  /** Nota mínima recomendada por área, posição do marcador das barras */
  recommendedAreaScore: number;
  isLoading: boolean;
  error: JourneyResultErrorType | null;
  labels: JourneyResultLabels;
  handleRetry: () => void;
}

export interface JourneyResultViewProps {
  /** Parâmetro [id] da rota */
  journeyId: string;
}
