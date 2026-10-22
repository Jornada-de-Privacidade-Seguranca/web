import axios from "axios";
import { axiosInstance, type ApiResponse } from "@services/httpClient";
import { env } from "@shared/config/env";

export interface PreQuestionnaireStepAnswer {
  selectedOption: string;
}

export interface PreQuestionnaireStepData {
  slug: string;
  step: string;
  journeyTitle?: string;
  selectedOption: string | null;
}

export class PreQuestionnaireRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreQuestionnaireRequestError";
  }
}

// Armazenamento em memória para ambiente de desenvolvimento offline
const DEV_MOCK_STORE: Record<string, PreQuestionnaireStepData> = {
  "data-governance:english": {
    slug: "data-governance",
    step: "english",
    journeyTitle: "Governança de Dados",
    selectedOption: null,
  },
  "lgpd-basics:english": {
    slug: "lgpd-basics",
    step: "english",
    journeyTitle: "Fundamentos de LGPD",
    selectedOption: null,
  },
  "data-governance:role-tenure": {
    slug: "data-governance",
    step: "role-tenure",
    journeyTitle: "Governança de Dados",
    selectedOption: null,
  },
  "lgpd-basics:role-tenure": {
    slug: "lgpd-basics",
    step: "role-tenure",
    journeyTitle: "Fundamentos de LGPD",
    selectedOption: null,
  },
};

export async function getPreQuestionnaireStep(
  slug: string,
  step: string
): Promise<PreQuestionnaireStepData> {
  const key = `${slug}:${step}`;
  try {
    const response = await axiosInstance.get<
      ApiResponse<PreQuestionnaireStepData> | PreQuestionnaireStepData
    >(`/journeys/${slug}/pre-questionnaire/${step}`);

    const payload = response.data;
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as ApiResponse<PreQuestionnaireStepData>).data;
    }
    return payload as PreQuestionnaireStepData;
  } catch (err: unknown) {
    // Em ambiente de desenvolvimento, enquanto o endpoint não estiver disponível no backend,
    // utilizamos o armazenamento em memória mock (padrão idêntico ao de journeySummaryService.ts).
    if (env.isDev) {
      if (DEV_MOCK_STORE[key]) {
        return DEV_MOCK_STORE[key];
      }
      // Retorna fallback genérico caso o slug não esteja previamente cadastrado no mock
      const fallback: PreQuestionnaireStepData = {
        slug,
        step,
        selectedOption: null,
      };
      DEV_MOCK_STORE[key] = fallback;
      return fallback;
    }

    if (axios.isAxiosError(err) && err.response?.data?.message) {
      throw new PreQuestionnaireRequestError(err.response.data.message);
    }

    throw new PreQuestionnaireRequestError(
      "Não foi possível carregar a etapa do pré-questionário."
    );
  }
}

export async function savePreQuestionnaireStep(
  slug: string,
  step: string,
  data: PreQuestionnaireStepAnswer
): Promise<void> {
  const key = `${slug}:${step}`;
  try {
    await axiosInstance.post(
      `/journeys/${slug}/pre-questionnaire/${step}`,
      data
    );
    if (env.isDev) {
      if (DEV_MOCK_STORE[key]) {
        DEV_MOCK_STORE[key].selectedOption = data.selectedOption;
      }
    }
  } catch (err: unknown) {
    // Em ambiente de desenvolvimento, enquanto o endpoint não estiver disponível no backend,
    // atualizamos o armazenamento em memória mock (padrão idêntico ao de journeySummaryService.ts).
    if (env.isDev) {
      if (!DEV_MOCK_STORE[key]) {
        DEV_MOCK_STORE[key] = {
          slug,
          step,
          selectedOption: data.selectedOption,
        };
      } else {
        DEV_MOCK_STORE[key].selectedOption = data.selectedOption;
      }
      return;
    }

    if (axios.isAxiosError(err) && err.response?.data?.message) {
      throw new PreQuestionnaireRequestError(err.response.data.message);
    }

    throw new PreQuestionnaireRequestError(
      "Não foi possível salvar a sua resposta."
    );
  }
}
