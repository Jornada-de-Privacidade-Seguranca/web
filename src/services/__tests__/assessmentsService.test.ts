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

  it("deve buscar as jornadas em andamento do usuário e mapear para PaginatedResponse<Journey>", async () => {
    const apiResponse = {
      success: true,
      message: "Jornadas retornadas com sucesso.",
      data: [
        {
          id: 10,
          user_id: 2,
          user_name: "Maria Silva",
          journey_profile: {
            id: 1,
            name: "Encarregado pelo Tratamento de Dados Pessoais",
            description: "Privacidade e Seguranca",
            knowledge_domain: { id: 1, name: "Privacidade" },
          },
          started_at: "2026-07-23 16:30:00",
          finished_at: null,
          status: "ongoing",
          is_completed: false,
          summary: {
            acquired_knowledges_count: 8,
            professional_certifications_count: 2,
          },
        },
      ],
      meta: {
        pagination: {
          current_page: 2,
          per_page: 6,
          total: 7,
          last_page: 2,
          has_next_page: false,
        },
      },
    };

    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(mockResponse(apiResponse));

    const result = await getPendingAssessments({ userId: 2, page: 2, perPage: 6 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users/2/journeys",
        params: { status: "ongoing", page: 2, per_page: 6 },
      })
    );
    expect(result).toEqual({
      items: [
        {
          id: "10",
          title: "Encarregado pelo Tratamento de Dados Pessoais",
          description: "Privacidade e Seguranca",
          domain: "privacy",
          status: "in_progress",
          href: "/jornada/atual/competencias/0",
          competenciesCount: 8,
          estimatedMinutes: 20,
          origin: "self_started",
          isSelfStarted: true,
        },
      ],
      total: 7,
      page: 2,
      limit: 6,
      totalPages: 2,
    });
  });

  it("deve usar page=1 e per_page=6 por padrão e tolerar lista vazia", async () => {
    const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [],
        meta: {
          pagination: {
            current_page: 1,
            per_page: 6,
            total: 0,
            last_page: 1,
            has_next_page: false,
          },
        },
      })
    );

    const result = await getPendingAssessments({ userId: 5 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users/5/journeys",
        params: { status: "ongoing", page: 1, per_page: 6 },
      })
    );
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("deve buscar o catálogo em /journey-profiles e mapear perfis para cards que levam ao resumo do perfil", async () => {
    const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 4,
            name_pt: "Titular",
            name_en: "Data Subject",
            description_pt: "Perfil do titular",
            description_en: "Data subject profile",
            type: 1,
          },
        ],
        meta: {
          pagination: { current_page: 2, per_page: 6, total: 18, last_page: 3, has_next_page: true },
        },
      })
    );

    const result = await getCatalogAssessments({ page: 2, limit: 6, locale: "en" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/journey-profiles",
        params: { page: 2, per_page: 6 },
      })
    );
    expect(result).toEqual({
      items: [
        {
          id: "4",
          title: "Data Subject",
          description: "Data subject profile",
          domain: "privacy",
          competenciesCount: 10,
          estimatedMinutes: 15,
          status: "not_started",
          href: "/jornada/perfil/4",
        },
      ],
      total: 18,
      page: 2,
      limit: 6,
      totalPages: 3,
    });
  });

  it("deve lançar erro quando a resposta HTTP for status de erro (ex: 500)", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(500, { message: "Erro interno no servidor" })
    );

    await expect(getPendingAssessments({ userId: 1 })).rejects.toThrow(
      "Erro interno no servidor"
    );
  });

  it("deve usar description como fallback de title quando name for ausente", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 20,
            user_id: 2,
            journey_profile: {
              id: 1,
              description: "Especialista em Proteção de Dados",
              knowledge_domain: { id: 1, name: "Privacidade" },
            },
            status: "ongoing",
            is_completed: false,
          },
        ],
        meta: {
          pagination: {
            current_page: 1,
            per_page: 6,
            total: 1,
            last_page: 1,
            has_next_page: false,
          },
        },
      })
    );

    const result = await getPendingAssessments({ userId: 2 });
    expect(result.items[0].title).toBe("Especialista em Proteção de Dados");
  });

  it("deve retornar lista vazia sem chamar requisição HTTP quando userId não for informado", async () => {
    const requestSpy = vi.spyOn(axiosInstance, "request");
    const result = await getPendingAssessments({ userId: 0 });

    expect(requestSpy).not.toHaveBeenCalled();
    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 1,
    });
  });
});
