import {
  getJourney,
  JourneyRequestError,
  type JourneyDetailApi,
} from "@services/journeyService";
import {
  PRE_QUESTIONNAIRE_STEPS,
  type PreQuestionnaireStepSlug,
} from "@shared/utils/journeyRoutes";

export type JourneyStatus = "not_started" | "in_progress" | "completed";

export interface JourneyProgress {
  firstStepSlug: string;
  lastAnsweredStepSlug: string | null;
}

export interface JourneySummary {
  id: string;
  title: string;
  /** Total de etapas do fluxo (pré-questionário + competências) */
  stepsCount: number;
  /** Etapas com resposta registrada na jornada */
  completedStepsCount: number;
  estimatedMinutes: number;
  areasCount: number;
  competenciesCount: number;
  status: JourneyStatus;
  progress: JourneyProgress;
}

export type JourneySummaryLocale = "pt" | "en";

export type JourneySummaryErrorType = "not_found" | "server_error";

export class JourneySummaryRequestError extends Error {
  readonly type: JourneySummaryErrorType;

  constructor(type: JourneySummaryErrorType, message: string) {
    super(message);
    this.name = "JourneySummaryRequestError";
    this.type = type;
  }
}

/** Perguntas de escolha do pré-questionário (todas as etapas antes de "competencias"). */
const PRE_QUESTIONNAIRE_QUESTIONS_COUNT = PRE_QUESTIONNAIRE_STEPS.length - 1;

/** Tempo médio estimado para responder cada pergunta ou competência. */
const SECONDS_PER_ANSWER = 20;

/**
 * Duração estimada em minutos: perguntas do pré-questionário mais uma
 * resposta por competência, arredondada para cima (mínimo de 1 minuto).
 */
export function estimateJourneyMinutes(competenciesCount: number): number {
  const totalSeconds =
    (PRE_QUESTIONNAIRE_QUESTIONS_COUNT + competenciesCount) * SECONDS_PER_ANSWER;
  return Math.max(1, Math.ceil(totalSeconds / 60));
}

const FIRST_STEP_SLUG: PreQuestionnaireStepSlug = "experiencia-profissional";

/**
 * Etapas na ordem oficial do pré-questionário, com o teste que indica se
 * a jornada já tem resposta registrada para cada uma.
 */
const ANSWERED_STEP_CHECKS: [PreQuestionnaireStepSlug, (j: JourneyDetailApi) => boolean][] = [
  ["experiencia-profissional", (j) => j.answers?.professional_experience != null],
  ["english", (j) => j.answers?.english_proficiency != null],
  ["tempo-atuacao-perfil", (j) => j.answers?.profile_experience != null],
  ["formacao-academica", (j) => (j.answers?.higher_education_courses?.length ?? 0) > 0],
  ["certificacoes-profissionais", (j) => (j.professional_certifications?.length ?? 0) > 0],
  ["competencias", (j) => (j.acquired_knowledges?.length ?? 0) > 0],
];

function getAnsweredSteps(journey: JourneyDetailApi): PreQuestionnaireStepSlug[] {
  return ANSWERED_STEP_CHECKS.filter(([, isAnswered]) => isAnswered(journey)).map(
    ([slug]) => slug
  );
}

export function mapJourneyToSummary(
  journey: JourneyDetailApi,
  locale: JourneySummaryLocale
): JourneySummary {
  const profile = journey.journey_profile;
  const competencies = profile?.competencies ?? [];
  const areaIds = new Set(
    competencies
      .map((competency) => competency.knowledge_area?.id)
      .filter((id): id is number => id != null)
  );
  const answeredSteps = getAnsweredSteps(journey);
  const lastAnsweredStepSlug = answeredSteps[answeredSteps.length - 1] ?? null;

  const status: JourneyStatus =
    journey.status === "completed"
      ? "completed"
      : lastAnsweredStepSlug
        ? "in_progress"
        : "not_started";

  return {
    id: String(journey.id),
    title: (locale === "en" ? profile?.name_en : profile?.name_pt) ?? "",
    stepsCount: PRE_QUESTIONNAIRE_STEPS.length,
    completedStepsCount:
      status === "completed" ? PRE_QUESTIONNAIRE_STEPS.length : answeredSteps.length,
    estimatedMinutes: estimateJourneyMinutes(competencies.length),
    areasCount: areaIds.size,
    competenciesCount: competencies.length,
    status,
    progress: { firstStepSlug: FIRST_STEP_SLUG, lastAnsweredStepSlug },
  };
}

/**
 * O backend não expõe GET /journeys/:id/summary; o resumo é montado a partir
 * de GET /journeys/{journey} (em dev, os mocks de journeyService.ts).
 */
export async function getJourneySummary(
  id: string,
  locale: JourneySummaryLocale
): Promise<JourneySummary> {
  try {
    const journey = await getJourney(id);
    return mapJourneyToSummary(journey, locale);
  } catch (err: unknown) {
    if (err instanceof JourneyRequestError && err.type === "not_found") {
      throw new JourneySummaryRequestError("not_found", "Jornada não encontrada.");
    }

    throw new JourneySummaryRequestError(
      "server_error",
      "Não foi possível carregar o resumo da jornada."
    );
  }
}
