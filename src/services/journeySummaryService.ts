import axios from "axios";
import { axiosInstance, type ApiResponse } from "@services/httpClient";
import type { JourneySummary } from "@features/journey-summary/journeySummary.types";
import { env } from "@/shared/config/env";

export type JourneySummaryErrorType = "not_found" | "server_error";

export class JourneySummaryRequestError extends Error {
  readonly type: JourneySummaryErrorType;

  constructor(type: JourneySummaryErrorType, message: string) {
    super(message);
    this.name = "JourneySummaryRequestError";
    this.type = type;
  }
}

const MOCK_JOURNEY_SUMMARIES: Record<string, JourneySummary> = {
  "1": {
    id: "1",
    slug: "data-governance",
    title: "Governança de Dados",
    questionsCount: 12,
    estimatedMinutes: 18,
    areasCount: 13,
    competenciesCount: 39,
    status: "not_started",
    progress: { firstStepSlug: "pre-questionario", lastAnsweredStepSlug: null },
  },
  "2": {
    id: "2",
    slug: "data-governance",
    title: "Governança de Dados",
    questionsCount: 12,
    estimatedMinutes: 18,
    areasCount: 13,
    competenciesCount: 39,
    status: "in_progress",
    progress: {
      firstStepSlug: "pre-questionario",
      lastAnsweredStepSlug: "formacao-academica",
    },
  },
  "3": {
    id: "3",
    slug: "data-governance",
    title: "Governança de Dados",
    questionsCount: 12,
    estimatedMinutes: 18,
    areasCount: 13,
    competenciesCount: 39,
    status: "completed",
    progress: {
      firstStepSlug: "pre-questionario",
      lastAnsweredStepSlug: "competencias",
    },
  },
};

/**
 * O backend ainda não expõe GET /journeys/:id/summary (ver openapi.yaml).
 * Em desenvolvimento, respostas de falha caem para os mocks acima — a mesma
 * estratégia usada em resultsService.ts enquanto o endpoint não existe.
 */
export async function getJourneySummary(id: string): Promise<JourneySummary> {
  try {
    const response = await axiosInstance.get<ApiResponse<JourneySummary> | JourneySummary>(
      `/journeys/${id}/summary`
    );
    const payload = response.data;
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as ApiResponse<JourneySummary>).data;
    }
    return payload as JourneySummary;
  } catch (err: unknown) {
    if (env.isDev) {
      const mock = MOCK_JOURNEY_SUMMARIES[id];
      if (mock) {
        return mock;
      }
    }

    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new JourneySummaryRequestError("not_found", "Jornada não encontrada.");
    }

    throw new JourneySummaryRequestError(
      "server_error",
      "Não foi possível carregar o resumo da jornada."
    );
  }
}
