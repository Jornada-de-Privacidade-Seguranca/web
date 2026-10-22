import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import {
  getPreQuestionnaireStep,
  savePreQuestionnaireStep,
  PreQuestionnaireRequestError,
} from "../preQuestionnaireService";
import { axiosInstance } from "../httpClient";
import { env } from "@shared/config/env";

vi.mock("@shared/config/env", () => ({
  env: {
    isDev: true,
  },
}));

function mockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as AxiosResponse["config"],
  };
}

function mockAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      data,
      status,
      statusText: "",
      headers: {},
      config: {} as AxiosResponse["config"],
    } as AxiosResponse
  );
}

describe("preQuestionnaireService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (env as { isDev: boolean }).isDev = true;
  });

  describe("getPreQuestionnaireStep", () => {
    it("deve desembrulhar resposta quando vier no formato ApiResponse (com campo data)", async () => {
      const mockData = {
        slug: "data-governance",
        step: "english",
        journeyTitle: "Governança de Dados",
        selectedOption: "basic-reading",
      };

      vi.spyOn(axiosInstance, "get").mockResolvedValueOnce(
        mockResponse({ success: true, data: mockData })
      );

      const result = await getPreQuestionnaireStep("data-governance", "english");
      expect(result).toEqual(mockData);
    });

    it("deve retornar resposta direta quando payload vier cru (sem envelope ApiResponse)", async () => {
      const mockData = {
        slug: "lgpd-basics",
        step: "english",
        journeyTitle: "Fundamentos de LGPD",
        selectedOption: "none",
      };

      vi.spyOn(axiosInstance, "get").mockResolvedValueOnce(
        mockResponse(mockData)
      );

      const result = await getPreQuestionnaireStep("lgpd-basics", "english");
      expect(result).toEqual(mockData);
    });

    it("em ambiente de dev (env.isDev=true), deve retornar o mock pré-configurado quando a requisição falhar", async () => {
      vi.spyOn(axiosInstance, "get").mockRejectedValueOnce(
        new Error("Network error")
      );

      const result = await getPreQuestionnaireStep("data-governance", "english");
      expect(result.slug).toBe("data-governance");
      expect(result.step).toBe("english");
      expect(result.journeyTitle).toBe("Governança de Dados");
    });

    it("em ambiente de dev (env.isDev=true), deve criar e cachear fallback para slug não cadastrado", async () => {
      vi.spyOn(axiosInstance, "get").mockRejectedValue(
        new Error("Network error")
      );

      const result = await getPreQuestionnaireStep("novo-percurso-teste", "english");
      expect(result.slug).toBe("novo-percurso-teste");
      // O identificador é o id da jornada, não um slug: não há título derivado
      expect(result.journeyTitle).toBeUndefined();
      expect(result.selectedOption).toBeNull();

      // Chamada subsequente deve retornar a entrada recém-armazenada
      const cached = await getPreQuestionnaireStep("novo-percurso-teste", "english");
      expect(cached).toBe(result);
    });

    it("em ambiente de produção (env.isDev=false), deve lançar PreQuestionnaireRequestError com mensagem do backend", async () => {
      (env as { isDev: boolean }).isDev = false;

      vi.spyOn(axiosInstance, "get").mockRejectedValueOnce(
        mockAxiosError(400, { message: "Etapa inválida ou não encontrada" })
      );

      await expect(
        getPreQuestionnaireStep("data-governance", "invalid-step")
      ).rejects.toThrowError("Etapa inválida ou não encontrada");
    });

    it("em ambiente de produção (env.isDev=false), deve lançar PreQuestionnaireRequestError com mensagem padrão para erro genérico", async () => {
      (env as { isDev: boolean }).isDev = false;

      vi.spyOn(axiosInstance, "get").mockRejectedValueOnce(
        new Error("Erro de conexão com o servidor")
      );

      await expect(
        getPreQuestionnaireStep("data-governance", "english")
      ).rejects.toThrow(PreQuestionnaireRequestError);
    });
  });

  describe("savePreQuestionnaireStep", () => {
    it("deve realizar post com sucesso", async () => {
      const postSpy = vi
        .spyOn(axiosInstance, "post")
        .mockResolvedValueOnce(mockResponse({ success: true }));

      await savePreQuestionnaireStep("data-governance", "english", {
        selectedOption: "advanced-fluent",
      });

      expect(postSpy).toHaveBeenCalledWith(
        "/journeys/data-governance/pre-questionnaire/english",
        { selectedOption: "advanced-fluent" }
      );
    });

    it("em ambiente de dev (env.isDev=true), deve salvar a resposta no mock store quando a requisição falhar", async () => {
      vi.spyOn(axiosInstance, "post").mockRejectedValueOnce(
        new Error("Offline backend")
      );

      await savePreQuestionnaireStep("data-governance", "english", {
        selectedOption: "intermediate-reading-writing",
      });

      // Em seguida, ao buscar a etapa com falha de rede, a opção salva deve persistir
      vi.spyOn(axiosInstance, "get").mockRejectedValueOnce(
        new Error("Offline backend")
      );

      const stepData = await getPreQuestionnaireStep("data-governance", "english");
      expect(stepData.selectedOption).toBe("intermediate-reading-writing");
    });

    it("em ambiente de dev (env.isDev=true), deve criar nova entrada no mock store caso o slug não exista", async () => {
      vi.spyOn(axiosInstance, "post").mockRejectedValueOnce(
        new Error("Offline backend")
      );

      await savePreQuestionnaireStep("slug-novo-save", "english", {
        selectedOption: "basic-reading",
      });

      vi.spyOn(axiosInstance, "get").mockRejectedValueOnce(
        new Error("Offline backend")
      );

      const stepData = await getPreQuestionnaireStep("slug-novo-save", "english");
      expect(stepData.selectedOption).toBe("basic-reading");
    });

    it("em ambiente de produção (env.isDev=false), deve lançar PreQuestionnaireRequestError com mensagem do backend", async () => {
      (env as { isDev: boolean }).isDev = false;

      vi.spyOn(axiosInstance, "post").mockRejectedValueOnce(
        mockAxiosError(422, { message: "Opção selecionada é inválida" })
      );

      await expect(
        savePreQuestionnaireStep("data-governance", "english", {
          selectedOption: "invalid",
        })
      ).rejects.toThrow("Opção selecionada é inválida");
    });

    it("em ambiente de produção (env.isDev=false), deve lançar PreQuestionnaireRequestError com mensagem padrão para erro genérico", async () => {
      (env as { isDev: boolean }).isDev = false;

      vi.spyOn(axiosInstance, "post").mockRejectedValueOnce(
        new Error("Erro de infraestrutura")
      );

      await expect(
        savePreQuestionnaireStep("data-governance", "english", {
          selectedOption: "none",
        })
      ).rejects.toThrow("Não foi possível salvar a sua resposta.");
    });
  });
});
