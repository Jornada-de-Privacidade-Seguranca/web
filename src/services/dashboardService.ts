import { apiRequest } from "@services/httpClient";
import { getJourneyProfile } from "@services/journeyProfileService";
import { estimateJourneyMinutes } from "@services/journeySummaryService";
import { normalizeScore } from "@shared/utils/scoreBand";
import type {
  DashboardApi,
  DashboardDataResponse,
  DashboardJourneyApi,
  DashboardLocale,
  DashboardMetrics,
  JourneyMetricsApi,
  LastCompletedAssessment,
  PendingAssessment,
  UserJourneyListItemApi,
} from "@features/painel/painel.types";

/**
 * Jornadas buscadas na listagem do usuário, de onde vêm a nota e o progresso.
 * Cobre a jornada em andamento, a última concluída e as recentes do /dashboard.
 */
export const DASHBOARD_JOURNEYS_PER_PAGE = 5;

function localize(
  pt: string | null | undefined,
  en: string | null | undefined,
  locale: DashboardLocale,
): string {
  return (locale === "en" ? en : pt) || pt || en || "";
}

/** Competências do perfil da jornada em andamento; null quando o perfil não informa. */
async function getCompetenciesCount(profileId: number): Promise<number | null> {
  const profile = await getJourneyProfile(String(profileId));
  const count = profile.competencies_count;
  return typeof count === "number" && count > 0 ? count : null;
}

async function mapPendingJourney(
  journey: DashboardJourneyApi,
  listItem: UserJourneyListItemApi | undefined,
  locale: DashboardLocale,
): Promise<PendingAssessment> {
  const profile = journey.journey_profile;
  const competenciesCount = profile
    ? await getCompetenciesCount(profile.id)
    : null;
  const isStarted = (listItem?.summary?.acquired_knowledges_count ?? 0) > 0;

  return {
    id: String(journey.id),
    title: localize(profile?.name_pt, profile?.name_en, locale),
    description: localize(
      profile?.description_pt,
      profile?.description_en,
      locale,
    ),
    status: isStarted ? "in_progress" : "pending",
    totalQuestions: competenciesCount,
    estimatedMinutes:
      competenciesCount !== null
        ? estimateJourneyMinutes(competenciesCount)
        : null,
  };
}

function mapCompletedJourney(
  journey: DashboardJourneyApi,
  listItem: UserJourneyListItemApi | undefined,
  locale: DashboardLocale,
): LastCompletedAssessment {
  const profile = journey.journey_profile;
  const score = listItem?.score;

  return {
    id: String(journey.id),
    title: localize(profile?.name_pt, profile?.name_en, locale),
    completedAt: journey.finished_at,
    score: typeof score === "number" ? normalizeScore(score) : null,
  };
}

/**
 * Dados do painel: GET /dashboard traz as jornadas e GET /users/{user}/journeys,
 * em paralelo, a nota e o progresso de cada uma, cruzados pelo id. Com jornada
 * em andamento, o perfil dela informa o número de competências.
 */
export async function getDashboardData(
  userId: number | string,
  locale: DashboardLocale,
): Promise<DashboardDataResponse> {
  const [dashboard, userJourneys] = await Promise.all([
    apiRequest<DashboardApi>(
      "/dashboard",
      {},
      "Não foi possível carregar o painel.",
    ),
    apiRequest<UserJourneyListItemApi[]>(
      `/users/${userId}/journeys`,
      { params: { per_page: DASHBOARD_JOURNEYS_PER_PAGE } },
      "Não foi possível carregar as jornadas do usuário.",
    ),
  ]);

  const listById = new Map(
    (Array.isArray(userJourneys) ? userJourneys : []).map((item) => [
      item.id,
      item,
    ]),
  );
  const { unfinished_journey, latest_journey, recent_journeys } =
    dashboard.journeys;

  return {
    pending: unfinished_journey
      ? await mapPendingJourney(
          unfinished_journey,
          listById.get(unfinished_journey.id),
          locale,
        )
      : null,
    lastCompleted: latest_journey
      ? mapCompletedJourney(
          latest_journey,
          listById.get(latest_journey.id),
          locale,
        )
      : null,
    history: (recent_journeys ?? []).map((journey) =>
      mapCompletedJourney(journey, listById.get(journey.id), locale),
    ),
  };
}

/** Métricas do painel, de GET /users/{user}/journeys/metrics. */
export async function getDashboardMetrics(
  userId: number | string,
): Promise<DashboardMetrics> {
  const data = await apiRequest<JourneyMetricsApi>(
    `/users/${userId}/journeys/metrics`,
    {},
    "Não foi possível carregar as métricas do painel.",
  );

  return {
    completedJourneys: data.summary?.completed_journeys ?? 0,
    pendingJourneys: data.summary?.ongoing_journeys ?? 0,
    averageScore: normalizeScore(data.summary?.average_score),
  };
}
