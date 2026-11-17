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

export interface JourneyResultAcquiredKnowledgeApi {
  id: number;
  is_acquired: boolean;
  competency: JourneyResultCompetencyApi | null;
}

/** Dono da jornada, como GET /journeys/{journey} devolve em `user`. */
export interface JourneyResultUserApi {
  id: number | null;
  name: string | null;
  email: string | null;
  organization: string | null;
  sector: string | null;
  registration: string | null;
}

export interface JourneyResultApi {
  id: number;
  user?: JourneyResultUserApi | null;
  journey_profile: JourneyResultProfileApi | null;
  status: "ongoing" | "completed";
  finished_at: string | null;
  score: number | null;
  acquired_knowledges: JourneyResultAcquiredKnowledgeApi[];
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
}

/** Dados da tela derivados da jornada, sem estado de carregamento ou erro. */
export interface JourneyResultModel {
  journeyTitle: string;
  score: ScoreValue;
  declaredCount: number;
  totalCompetencies: number;
  isJointJourney: boolean;
  areaScoreGroups: AreaScoreGroup[];
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
  areas: {
    eyebrow: string;
    title: string;
    recommendation: string;
    markerAriaLabel: string;
  };
  competencies: {
    eyebrow: string;
    declaredTitle: string;
    undeclaredTitle: string;
    emptyGroup: string;
    difficultyPrefix: string;
    domainPrefix: string;
  };
  pdf: {
    downloadButton: string;
    generatingLabel: string;
  };
  errors: JourneyResultErrorLabels | null;
}

/**
 * "own": o resultado da própria pessoa (/jornada/[id]/resultado).
 * "admin": o resultado de outra pessoa, aberto pela listagem do admin (/admin/resultados/[id]).
 */
export type JourneyResultVariant = "own" | "admin";

export interface JourneyResultOptions {
  variant?: JourneyResultVariant;
  /** Query string da listagem do admin, devolvida no "Voltar" para manter filtros e página */
  listQuery?: string;
}

/** Um dado do bloco de identificação da pessoa. */
export interface JourneyResultPersonField {
  id: "organization" | "sector" | "registration";
  label: string;
  /** Valor informado, ou o texto de "não informado" */
  value: string;
}

/** Bloco que identifica de quem é o resultado, só na visão do admin. */
export interface JourneyResultPerson {
  ariaLabel: string;
  initials: string;
  name: string;
  email: string;
  fields: JourneyResultPersonField[];
}

/** PDF do resultado devolvido por GET /journeys/{journey}/pdf. */
export interface JourneyResultPdfFile {
  blob: Blob;
  /** Nome do arquivo do Content-Disposition, ou resultado-jornada-{id}.pdf */
  filename: string;
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
  isJointJourney: boolean;
  areaScoreGroups: AreaScoreGroup[];
  declaredCompetencies: CompetencyAreaGroup[];
  undeclaredCompetencies: CompetencyAreaGroup[];
  /** Link de "Refazer"; null na visão do admin, em que a jornada é de outra pessoa */
  retakeUrl: string | null;
  resultsUrl: string;
  /** Identificação da pessoa; null no resultado da própria pessoa */
  person: JourneyResultPerson | null;
  /** Nota mínima recomendada por área, posição do marcador das barras */
  recommendedAreaScore: number;
  isLoading: boolean;
  error: JourneyResultErrorType | null;
  labels: JourneyResultLabels;
  handleRetry: () => void;
  /** O PDF só pode ser baixado de uma jornada concluída */
  canDownloadPdf: boolean;
  isDownloadingPdf: boolean;
  /** Mensagem da falha no download; null sem erro ou quando a sessão expirou (401) */
  pdfError: string | null;
  handleDownloadPdf: () => void;
}

export interface JourneyResultViewProps extends JourneyResultOptions {
  /** Parâmetro [id] da rota */
  journeyId: string;
}
