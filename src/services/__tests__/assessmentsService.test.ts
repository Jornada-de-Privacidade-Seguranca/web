import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import {
  getPendingAssessments,
  getCatalogAssessments,
} from "../assessmentsService";
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

describe("assessmentsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar jornadas pendentes desembrulhando a propriedade 'data'", async () => {
    const mockData = {
      items: [
        {
          id: "j1",
          title: "Segurança Digital Básica",
          description: "Aprenda conceitos fundamentais",
          totalQuestions: 10,
          estimatedMinutes: 15,
          status: "not_started" as const,
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

    const result = await getPendingAssessments({ page: 1, limit: 6 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/assessments/pending",
        params: { page: 1, limit: 6 },
      })
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Segurança Digital Básica");
  });

  it("deve buscar o catálogo de jornadas aplicando o filtro de busca", async () => {
    const mockData = {
      items: [
        {
          id: "j2",
          title: "LGPD na Prática",
          description: "Entenda a lei geral de proteção de dados",
          totalQuestions: 8,
          estimatedMinutes: 12,
          status: "completed" as const,
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

    const result = await getCatalogAssessments({
      page: 1,
      limit: 6,
      search: "LGPD",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/assessments",
        params: { page: 1, limit: 6, search: "LGPD" },
      })
    );
    expect(result.items[0].title).toBe("LGPD na Prática");
  });

  it("deve lançar erro quando a resposta HTTP for status de erro (ex: 500)", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(500, { message: "Erro interno no servidor" })
    );

    await expect(getPendingAssessments({})).rejects.toThrow(
      "Erro interno no servidor"
    );
  });
});
