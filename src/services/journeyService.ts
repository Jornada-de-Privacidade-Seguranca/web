import axios from "axios";
import { apiRequest, axiosInstance, type ApiResponse } from "@services/httpClient";
import { env } from "@shared/config/env";

export type JourneyDomain = "privacy" | "security" | "joint";

export type JourneyApiStatus = "ongoing" | "completed";

export interface JourneyKnowledgeDomainApi {
  id: number;
  name_pt: string;
  name_en: string;
}

export interface JourneyKnowledgeAreaApi {
  id: number;
  name_pt: string;
  name_en: string;
}

export interface JourneyCompetencyApi {
  id: number;
  knowledge_area: JourneyKnowledgeAreaApi | null;
}

export interface JourneyProfileApi {
  id: number;
  name_pt: string;
  name_en: string;
  knowledge_domain: JourneyKnowledgeDomainApi | null;
  competencies?: JourneyCompetencyApi[];
}

/** Respostas do pré-questionário já registradas na jornada. */
export interface JourneyAnswersApi {
  professional_experience: unknown | null;
  english_proficiency: unknown | null;
  profile_experience: unknown | null;
  higher_education_courses: unknown[];
}

/** Subconjunto de GET /journeys/{journey} usado pelo frontend. */
export interface JourneyDetailApi {
  id: number;
  journey_profile: JourneyProfileApi | null;
  status: JourneyApiStatus;
  answers?: JourneyAnswersApi;
  professional_certifications?: unknown[];
  acquired_knowledges?: unknown[];
}

export type JourneyErrorType = "not_found" | "server_error";

export class JourneyRequestError extends Error {
  readonly type: JourneyErrorType;

  constructor(type: JourneyErrorType, message: string) {
    super(message);
    this.name = "JourneyRequestError";
    this.type = type;
  }
}

/** Mapeamento de `knowledge_domain.id` (tabela de domínios de conhecimento) para o domínio da jornada. */
const KNOWLEDGE_DOMAIN_MAP: Record<number, JourneyDomain> = {
  1: "privacy",
  2: "security",
  3: "joint",
};

export function mapKnowledgeDomain(
  knowledgeDomain: JourneyKnowledgeDomainApi | null | undefined
): JourneyDomain | null {
  if (!knowledgeDomain) return null;
  return KNOWLEDGE_DOMAIN_MAP[knowledgeDomain.id] ?? null;
}

const MOCK_COMPETENCIES: JourneyCompetencyApi[] = [
  { id: 1, knowledge_area: { id: 1, name_pt: "Gestão de Privacidade", name_en: "Privacy Management" } },
  { id: 2, knowledge_area: { id: 1, name_pt: "Gestão de Privacidade", name_en: "Privacy Management" } },
  { id: 3, knowledge_area: { id: 2, name_pt: "Governança", name_en: "Governance" } },
];

const MOCK_EMPTY_ANSWERS: JourneyAnswersApi = {
  professional_experience: null,
  english_proficiency: null,
  profile_experience: null,
  higher_education_courses: [],
};

/**
 * Mocks usados apenas em desenvolvimento quando o backend não responde —
 * um por domínio: não iniciada (1), em andamento (2) e concluída (3).
 */
const MOCK_JOURNEYS: Record<string, JourneyDetailApi> = {
  "1": {
    id: 1,
    journey_profile: {
      id: 2,
      name_pt: "Encarregado de Dados",
      name_en: "Data Protection Officer",
      knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
      competencies: MOCK_COMPETENCIES,
    },
    status: "ongoing",
    answers: MOCK_EMPTY_ANSWERS,
  },
  "2": {
    id: 2,
    journey_profile: {
      id: 5,
      name_pt: "Analista de Segurança da Informação",
      name_en: "Information Security Analyst",
      knowledge_domain: {
        id: 2,
        name_pt: "Segurança da Informação",
        name_en: "Information Security",
      },
      competencies: MOCK_COMPETENCIES,
    },
    status: "ongoing",
    answers: {
      ...MOCK_EMPTY_ANSWERS,
      professional_experience: { id: 3 },
      english_proficiency: { id: 2 },
    },
  },
  "3": {
    id: 3,
    journey_profile: {
      id: 8,
      name_pt: "Gestor de Privacidade e Segurança",
      name_en: "Privacy and Security Manager",
      knowledge_domain: { id: 3, name_pt: "Conjunta", name_en: "Joint" },
      competencies: MOCK_COMPETENCIES,
    },
    status: "completed",
    answers: MOCK_EMPTY_ANSWERS,
  },
};

/** Status que indicam que a jornada não existe ou não pertence ao usuário. */
const NOT_FOUND_STATUSES = [403, 404, 422];

export async function getJourney(journeyId: string): Promise<JourneyDetailApi> {
  try {
    const response = await axiosInstance.get<
      ApiResponse<JourneyDetailApi> | JourneyDetailApi
    >(`/journeys/${journeyId}`);
    const payload = response.data;
    if (payload && typeof payload === "object" && "success" in payload) {
      return (payload as ApiResponse<JourneyDetailApi>).data;
    }
    return payload as JourneyDetailApi;
  } catch (err: unknown) {
    // Em desenvolvimento sem backend, cai para os mocks acima — mesma
    // estratégia usada em journeySummaryService.ts.
    if (env.isDev) {
      const mock = MOCK_JOURNEYS[journeyId];
      if (mock) {
        return mock;
      }
      if (!axios.isAxiosError(err) || !err.response) {
        throw new JourneyRequestError("not_found", "Jornada não encontrada.");
      }
    }

    if (
      axios.isAxiosError(err) &&
      err.response &&
      NOT_FOUND_STATUSES.includes(err.response.status)
    ) {
      throw new JourneyRequestError("not_found", "Jornada não encontrada.");
    }

    throw new JourneyRequestError(
      "server_error",
      "Não foi possível carregar os dados da jornada."
    );
  }
}

/** Item de GET /users/{user}/journeys usado para localizar a jornada em andamento. */
interface OngoingJourneyListItemApi {
  id: number;
}

/**
 * Busca a jornada em andamento do usuário. O backend garante no máximo uma por
 * vez, mas não expõe GET /journeys/current: localizamos o id pela listagem
 * filtrada por status e então buscamos o detalhe em GET /journeys/{journey}.
 * Sem jornada em andamento, lança JourneyRequestError("not_found").
 */
export async function getCurrentJourney(userId: number): Promise<JourneyDetailApi> {
  let ongoing: OngoingJourneyListItemApi[];
  try {
    ongoing = await apiRequest<OngoingJourneyListItemApi[]>(
      `/users/${userId}/journeys`,
      { params: { status: "ongoing", page: 1, per_page: 1 } },
      "Não foi possível carregar a jornada em andamento."
    );
  } catch {
    throw new JourneyRequestError(
      "server_error",
      "Não foi possível carregar a jornada em andamento."
    );
  }

  const current = Array.isArray(ongoing) ? ongoing[0] : undefined;
  if (!current) {
    throw new JourneyRequestError("not_found", "Nenhuma jornada em andamento.");
  }
  return getJourney(String(current.id));
}

/** Jornada recém-criada, como devolvida por POST /users/{user}/journeys. */
export interface CreatedJourneyApi {
  id: number;
}

/**
 * Inicia uma jornada do perfil informado para o usuário. Erros chegam como
 * ApiRequestError; 409 (JOURNEY_IN_PROGRESS) indica que já existe uma jornada
 * em andamento.
 */
export async function createJourney(
  userId: number,
  journeyProfileId: number
): Promise<CreatedJourneyApi> {
  return apiRequest<CreatedJourneyApi>(
    `/users/${userId}/journeys`,
    { method: "post", data: { journey_profile_id: journeyProfileId }, withCsrf: true },
    "Não foi possível iniciar a jornada."
  );
}

