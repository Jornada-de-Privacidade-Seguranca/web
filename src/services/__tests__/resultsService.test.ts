import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { getMetrics, getResultsList } from "../resultsService";
import { axiosInstance } from "../httpClient";
import { env } from "@shared/config/env";

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

describe("ResultsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar as métricas de KPI desembrulhando a propriedade 'data' e contendo o id do usuário na URL", async () => {
    const mockData = {
      totalCompleted: 15,
      domainMetrics: [
        { domain: "privacy", label: "Privacidade", averageScore: 84 },
      ],
    };

    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(mockResponse({ success: true, data: mockData }));

    const result = await getMetrics(42);

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/users/42/journeys/metrics" })
    );
    expect(result.totalCompleted).toBe(15);
    expect(result.domainMetrics).toHaveLength(1);
    expect(result.domainMetrics[0].averageScore).toBe(84);
  });

  it("resposta real sem domainMetrics não pode ganhar dados do mock", async () => {
    // Simula ambiente de produção onde isDev é falso
    const originalIsDev = env.isDev;
    try {
      (env as { isDev: boolean }).isDev = false;

      const mockData = {
        totalCompleted: 5,
        // domainMetrics ausente na resposta da API
      };

      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({ success: true, data: mockData })
      );

      const result = await getMetrics(1);

      expect(result.totalCompleted).toBe(5);
      expect(result.domainMetrics).toEqual([]);
    } finally {
      (env as { isDev: boolean }).isDev = originalIsDev;
    }
  });

  it("deve buscar a lista de resultados paginada contendo o id do usuário na URL e aplicando filtros", async () => {
    const mockData = {
      items: [
        {
          id: "r1",
          title: "Encarregado pelo Tratamento de Dados Pessoais",
          score: 88,
          completedAt: "2026-05-15T10:00:00Z",
          domain: "privacy",
          domainLabel: "Privacidade",
        },
      ],
      total: 1,
      page: 1,
      limit: 6,
      totalPages: 1,
    };

    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(mockResponse({ success: true, data: mockData }));

    const result = await getResultsList({
      userId: 42,
      page: 1,
      per_page: 6,
      search: "Encarregado",
      domains: ["privacy"],
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users/42/journeys",
        params: {
          page: 1,
          per_page: 6,
          search: "Encarregado",
          "domains[]": [1],
        },
      })
    );
    expect(result.items[0].title).toBe("Encarregado pelo Tratamento de Dados Pessoais");
  });

  it("deve lançar erro quando a API retornar status 500 mesmo em ambiente de desenvolvimento", async () => {
    const originalIsDev = env.isDev;
    try {
      (env as { isDev: boolean }).isDev = true;
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(500, { message: "Erro interno no servidor" })
      );

      await expect(getMetrics(1)).rejects.toThrow("Erro interno no servidor");
    } finally {
      (env as { isDev: boolean }).isDev = originalIsDev;
    }
  });

  it("deve usar o mock em dev somente em falha de rede (status undefined)", async () => {
    const originalIsDev = env.isDev;
    try {
      (env as { isDev: boolean }).isDev = true;
      // Erro de rede sem status HTTP
      const networkError = new AxiosError("Network Error", "ERR_NETWORK");
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(networkError);

      const result = await getMetrics(1);
      expect(result.totalCompleted).toBeGreaterThan(0);
    } finally {
      (env as { isDev: boolean }).isDev = originalIsDev;
    }
  });
});
