import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { getMetrics, getResultsList } from "../ResultsService";
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

  it("deve buscar as métricas de KPI desembrulhando a propriedade 'data'", async () => {
    const mockData = {
      totalCompleted: 15,
      averageScore: 76,
    };

    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(mockResponse({ success: true, data: mockData }));

    const result = await getMetrics();

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/results/metrics" })
    );
    expect(result.totalCompleted).toBe(15);
    expect(result.averageScore).toBe(76);
  });

  it("deve buscar a lista de resultados paginada aplicando filtro de busca", async () => {
    const mockData = {
      items: [
        {
          id: "r1",
          title: "Fundamentos de LGPD",
          description: "Avalie seu domínio sobre princípios de proteção de dados",
          score: 78,
          completedAt: "2026-05-20T00:00:00Z",
          questionsCount: 5,
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

    const result = await getResultsList({ page: 1, limit: 6, search: "LGPD" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/results",
        params: { page: 1, limit: 6, search: "LGPD" },
      })
    );
    expect(result.items[0].title).toBe("Fundamentos de LGPD");
  });

  it("deve lançar erro quando a API retornar status 500", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(500, { message: "Erro de servidor ao buscar métricas" })
    );

    await expect(getMetrics()).rejects.toThrow("Erro de servidor ao buscar métricas");
  });
});
