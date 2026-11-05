import {
  getJourney,
  JourneyRequestError,
  mapKnowledgeDomain,
  mapKnowledgeDomainId,
  type JourneyDetailApi,
  type JourneyDomain,
} from "@services/journeyService";
import { apiRequest } from "@services/httpClient";
import { normalizeScore } from "@shared/utils/scoreBand";
import {
  getJourneyProfile,
  JourneyProfileRequestError,
} from "@services/journeyProfileService";

export type JourneyStatus = "not_started" | "in_progress" | "completed";

export interface JourneySummary {
  /** Id da jornada; null no resumo de um perfil (jornada ainda não criada) */
  id: string | null;
  /** Id do perfil da jornada, usado para criar uma nova jornada ao iniciar/refazer */
  profileId: string | null;
  title: string;
  /** null quando o dado não está disponível (resumo de perfil) */
  estimatedMinutes: number | null;
  areasCount: number | null;
  competenciesCount: number | null;
  /** Domínio da jornada, usado no texto das instruções; null quando não informado */
  domain: JourneyDomain | null;
  status: JourneyStatus;
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

/** Tempo médio estimado para responder cada competência. */
const SECONDS_PER_ANSWER = 20;

/**
 * Duração estimada em minutos: uma resposta por competência, arredondada para
 * cima (mínimo de 1 minuto).
 */
export function estimateJourneyMinutes(competenciesCount: number): number {
  const totalSeconds = competenciesCount * SECONDS_PER_ANSWER;
  return Math.max(1, Math.ceil(totalSeconds / 60));
}

/** Respostas que indicam que a jornada já foi iniciada. */
const JOURNEY_STARTED_CHECKS: ((j: JourneyDetailApi) => boolean)[] = [
  (j) => j.answers?.professional_experience != null,
  (j) => j.answers?.english_proficiency != null,
  (j) => j.answers?.profile_experience != null,
  (j) => (j.answers?.higher_education_courses?.length ?? 0) > 0,
  (j) => (j.professional_certifications?.length ?? 0) > 0,
  (j) => (j.acquired_knowledges?.length ?? 0) > 0,
];

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
  const hasAnswers = JOURNEY_STARTED_CHECKS.some((isAnswered) => isAnswered(journey));

  const status: JourneyStatus =
    journey.status === "completed"
      ? "completed"
      : hasAnswers
        ? "in_progress"
        : "not_started";

  return {
    id: String(journey.id),
    profileId: profile?.id != null ? String(profile.id) : null,
    title: (locale === "en" ? profile?.name_en : profile?.name_pt) ?? "",
    estimatedMinutes: estimateJourneyMinutes(competencies.length),
    areasCount: areaIds.size,
    competenciesCount: competencies.length,
    domain: mapKnowledgeDomain(profile?.knowledge_domain),
    status,
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

/**
 * Resumo de um perfil de jornada, exibido antes de a jornada ser criada.
 * GET /journey-profiles não informa as competências do perfil, então duração,
 * áreas e competências ficam indisponíveis (null) até a jornada existir.
 */
export async function getProfileSummary(
  profileId: string,
  locale: JourneySummaryLocale
): Promise<JourneySummary> {
  try {
    const profile = await getJourneyProfile(profileId);
    return {
      id: null,
      profileId: String(profile.id),
      title: (locale === "en" ? profile.name_en : profile.name_pt) || profile.name_pt,
      estimatedMinutes: null,
      areasCount: null,
      competenciesCount: null,
      domain: mapKnowledgeDomainId(profile.type),
      status: "not_started",
    };
  } catch (err: unknown) {
    if (err instanceof JourneyProfileRequestError && err.type === "not_found") {
      throw new JourneySummaryRequestError("not_found", "Perfil de jornada não encontrado.");
    }
    throw new JourneySummaryRequestError(
      "server_error",
      "Não foi possível carregar o resumo da jornada."
    );
  }
}

/** Item de GET /users/{user}/journeys usado para a última nota. */
interface CompletedJourneyListItemApi {
  id: number;
  score: number | null;
}

/**
 * Nota (0 a 100) da jornada concluída mais recente do usuário nesse perfil, ou
 * null se ele ainda não concluiu nenhuma. A listagem vem ordenada da mais
 * recente para a mais antiga. Uma falha também resulta em null: a nota é só
 * informativa e não deve impedir o resumo de abrir.
 */
export async function getLastProfileScore(
  userId: number,
  profileId: string
): Promise<number | null> {
  try {
    const journeys = await apiRequest<CompletedJourneyListItemApi[]>(
      `/users/${userId}/journeys`,
      {
        params: {
          status: "completed",
          journey_profile_id: profileId,
          page: 1,
          per_page: 1,
        },
      },
      "Não foi possível carregar a última pontuação."
    );
    const last = Array.isArray(journeys) ? journeys[0] : undefined;
    return last?.score != null ? normalizeScore(last.score) : null;
  } catch {
    return null;
  }
}
