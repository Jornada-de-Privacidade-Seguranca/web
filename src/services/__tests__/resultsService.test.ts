import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { getMetrics, getResultsList } from "../resultsService";
import { axiosInstance } from "../httpClient";

function mockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as AxiosResponse["config"],
  };
}

function mockAxiosError(status: number | undefined, data?: unknown): AxiosError {
  return new AxiosError(
    "Request failed",
    status ? "ERR_BAD_REQUEST" : "ERR_NETWORK",
    undefined,
    undefined,
    status
      ? ({
          data,
          status,
          statusText: "",
          headers: {},
          config: {} as AxiosResponse["config"],
        } as AxiosResponse)
      : undefined
  );
}

const METRICS_RESPONSE = {
  success: true,
  data: {
    user_id: 42,
    summary: {
      total_journeys: 5,
      completed_journeys: 4,
      ongoing_journeys: 1,
      average_score: 71.5,
      highest_score: 90,
      latest_score: 64,
    },
    domains: [
      {
        domain_id: 1,
        domain_name_pt: "Privacidade",
        domain_name_en: "Privacy",
        completed_journeys: 3,
        average_score: 78.67,
      },
      {
        domain_id: 2,
        domain_name_pt: "Segurança da Informação",
        domain_name_en: "Information Security",
        completed_journeys: 1,
        average_score: 50,
      },
      {
        domain_id: 3,
        domain_name_pt: "Conjunta",
        domain_name_en: "Joint",
        completed_journeys: 0,
        average_score: null,
      },
    ],
  },
};

function journey(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    user_id: 42,
    journey_profile: {
      id: 7,
      name: "Encarregado pelo Tratamento de Dados Pessoais",
      description: "Descrição",
      knowledge_domain: { id: 1, name: "Privacidade" },
    },
    started_at: "2026-11-09 10:00:00",
    finished_at: "2026-11-09 23:30:00",
    cancelled_at: null,
    status: "completed",
    score: 87.6,
    ...overrides,
  };
}

describe("resultsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getMetrics", () => {
    it("busca as métricas do usuário e converte o resumo e os domínios", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse(METRICS_RESPONSE));

      const result = await getMetrics(42);

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ url: "/users/42/journeys/metrics" })
      );
      expect(result.totalCompleted).toBe(4);
      expect(result.averageScore).toBe(71.5);
      expect(result.domainMetrics).toEqual([
        { domain: "privacy", domainId: 1, namePt: "Privacidade", nameEn: "Privacy", averageScore: 78.67 },
        {
          domain: "security",
          domainId: 2,
          namePt: "Segurança da Informação",
          nameEn: "Information Security",
          averageScore: 50,
        },
        { domain: "joint", domainId: 3, namePt: "Conjunta", nameEn: "Joint", averageScore: null },
      ]);
    });

    it("mantém um domínio novo, que o front ainda não conhece, usando o id", async () => {
      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: {
            summary: { completed_journeys: 1, average_score: 40 },
            domains: [
              { domain_id: 9, domain_name_pt: "Governança", domain_name_en: "Governance", average_score: 40 },
            ],
          },
        })
      );

      const result = await getMetrics(42);

      expect(result.domainMetrics[0]).toMatchObject({ domain: "9", domainId: 9, namePt: "Governança" });
    });

    it("propaga o erro da API com a mensagem do backend", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(500, { success: false, message: "Erro interno no servidor" })
      );

      await expect(getMetrics(1)).rejects.toThrow("Erro interno no servidor");
    });

    it("não usa dados fictícios quando a rede falha", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(mockAxiosError(undefined));

      await expect(getMetrics(1)).rejects.toThrow(
        "Não foi possível carregar o resumo dos resultados."
      );
    });
  });

  describe("getResultsList", () => {
    it("pede só as jornadas concluídas, com a busca, os domínios e a paginação", async () => {
      const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: [journey(10)],
          meta: { pagination: { current_page: 2, per_page: 6, total: 7, last_page: 2 } },
        })
      );

      const result = await getResultsList({
        userId: 42,
        page: 2,
        per_page: 6,
        search: "  Encarregado ",
        domains: ["privacy", "joint"],
      });

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/users/42/journeys",
          params: {
            status: "completed",
            page: 2,
            per_page: 6,
            search: "Encarregado",
            "domains[]": [1, 3],
          },
        })
      );
      expect(result).toMatchObject({ total: 7, page: 2, limit: 6, totalPages: 2 });
    });

    it("não envia a busca nem os domínios quando estão vazios", async () => {
      const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({ success: true, data: [], meta: { pagination: { current_page: 1, per_page: 6, total: 0, last_page: 1 } } })
      );

      await getResultsList({ userId: 42, search: "   ", domains: [] });

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ params: { status: "completed", page: 1, per_page: 6 } })
      );
    });

    it("converte cada jornada em um resultado da tela", async () => {
      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: [journey(10)],
          meta: { pagination: { current_page: 1, per_page: 6, total: 1, last_page: 1 } },
        })
      );

      const result = await getResultsList({ userId: 42 });

      expect(result.items).toEqual([
        {
          id: "10",
          title: "Encarregado pelo Tratamento de Dados Pessoais",
          namePt: "Encarregado pelo Tratamento de Dados Pessoais",
          score: 88,
          completedAt: "2026-11-09T23:30:00Z",
          domain: "privacy",
          domainId: 1,
          domainNamePt: "Privacidade",
        },
      ]);
    });

    it("trata a última página zerada como uma página só", async () => {
      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({ success: true, data: [], meta: { pagination: { current_page: 1, per_page: 6, total: 0, last_page: 0 } } })
      );

      const result = await getResultsList({ userId: 42 });

      expect(result.totalPages).toBe(1);
      expect(result.items).toEqual([]);
    });

    it("propaga o 403 sem permissão com a mensagem do backend", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(403, {
          success: false,
          code: "PERMISSION_DENIED",
          message: "Voce nao possui permissao para visualizar as jornadas deste usuario.",
        })
      );

      await expect(getResultsList({ userId: 42 })).rejects.toMatchObject({
        status: 403,
        code: "PERMISSION_DENIED",
      });
    });

    it("não usa dados fictícios quando a rede falha", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(mockAxiosError(undefined));

      await expect(getResultsList({ userId: 42 })).rejects.toThrow(
        "Não foi possível carregar os resultados das jornadas."
      );
    });
  });
});
