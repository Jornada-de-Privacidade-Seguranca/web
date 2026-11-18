import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import {
  getPendingAssessments,
  cancelPendingJourney,
  getCatalogAssessments,
} from "../assessmentsService";
import { axiosInstance, clearCsrfToken } from "../httpClient";
import * as journeyProfileService from "../journeyProfileService";

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
    // Detalhe do perfil da jornada pendente: por padrão falha, e a jornada fica
    // sem competências e tempo, como antes
    vi.spyOn(journeyProfileService, "getJourneyProfile").mockRejectedValue(
      new journeyProfileService.JourneyProfileRequestError("server_error", "Falha")
    );
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
            name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
            name_en: "Data Protection Officer (DPO)",
            description_pt: "Privacidade e Seguranca",
            description_en: "Privacy and Security",
            knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
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
          origin: null,
          isSelfStarted: false,
        },
      ],
      total: 7,
      page: 2,
      limit: 6,
      totalPages: 2,
    });
  });

  it("mapeia a origem e quem atribuiu a jornada pendente", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 11,
            user_id: 2,
            user_name: "Maria Silva",
            journey_profile: {
              id: null,
              name_pt: "Operador",
              name_en: "Operator",
              description_pt: null,
              description_en: null,
              knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
            },
            started_at: "2026-11-10 09:00:00",
            finished_at: null,
            status: "ongoing",
            is_completed: false,
            origin: "assigned",
            assigned_by: { id: 1, name: "Carla Gestora" },
            summary: { acquired_knowledges_count: 0, professional_certifications_count: 0 },
          },
        ],
        meta: {
          pagination: { current_page: 1, per_page: 6, total: 1, last_page: 1, has_next_page: false },
        },
      })
    );

    const result = await getPendingAssessments({ userId: 2 });

    expect(result.items[0]).toMatchObject({
      id: "11",
      origin: "assigned",
      isSelfStarted: false,
      assignedByName: "Carla Gestora",
    });
  });

  it("deve usar o nome e a descrição em inglês quando o idioma for en", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 10,
            user_id: 2,
            journey_profile: {
              id: 1,
              name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
              name_en: "Data Protection Officer (DPO)",
              description_pt: "Privacidade e Seguranca",
              description_en: "Privacy and Security",
              knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
            },
            status: "ongoing",
            is_completed: false,
          },
        ],
        meta: { pagination: { current_page: 1, per_page: 1, total: 1, last_page: 1 } },
      })
    );

    const result = await getPendingAssessments({ userId: 2, perPage: 1, locale: "en" });

    expect(result.items[0]).toMatchObject({
      title: "Data Protection Officer (DPO)",
      description: "Privacy and Security",
    });
  });

  it("deve usar o português quando faltar a tradução em inglês", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 10,
            user_id: 2,
            journey_profile: {
              id: 1,
              name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
              name_en: null,
              description_pt: "Privacidade e Seguranca",
              description_en: null,
              knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: null },
            },
            status: "ongoing",
            is_completed: false,
          },
        ],
        meta: { pagination: { current_page: 1, per_page: 1, total: 1, last_page: 1 } },
      })
    );

    const result = await getPendingAssessments({ userId: 2, perPage: 1, locale: "en" });

    expect(result.items[0]).toMatchObject({
      title: "Encarregado pelo Tratamento de Dados Pessoais",
      description: "Privacidade e Seguranca",
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

  it("deve buscar o catálogo em /journey-profiles e mapear como not_started e sem nota quando user_status for ausente", async () => {
    const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 1,
            name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
            name_en: "Data Protection Officer",
            description_pt: "Canal de comunicação",
            description_en: "Communication channel",
            type: 1,
          },
          {
            id: 4,
            name_pt: "Operador de Dados",
            name_en: "Data Operator",
            description_pt: "Tratamento de dados",
            description_en: "Data processing",
            type: 1,
          },
        ],
        meta: {
          pagination: { current_page: 1, per_page: 9, total: 2, last_page: 1, has_next_page: false },
        },
      })
    );

    const result = await getCatalogAssessments({ page: 1, limit: 9, locale: "pt" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/journey-profiles",
        params: { page: 1, per_page: 9 },
      })
    );
    expect(result.items).toHaveLength(2);

    // Perfil da API real sem user_status não pode sair como Concluída nem com nota inventada
    expect(result.items[0]).toEqual({
      id: "1",
      title: "Encarregado pelo Tratamento de Dados Pessoais",
      description: "Canal de comunicação",
      domain: "privacy",
      competenciesCount: undefined,
      estimatedMinutes: undefined,
      status: "not_started",
      score: undefined,
      href: "/jornada/perfil/1",
    });

    // Perfil 4: não iniciado e sem campos inventados
    expect(result.items[1]).toEqual({
      id: "4",
      title: "Operador de Dados",
      description: "Tratamento de dados",
      domain: "privacy",
      competenciesCount: undefined,
      estimatedMinutes: undefined,
      status: "not_started",
      score: undefined,
      href: "/jornada/perfil/4",
    });
  });

  it("deve converter a situação, a nota e o tempo estimado de cada perfil", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 99,
            name_pt: "Perfil Concluído",
            name_en: "Completed Profile",
            description_pt: "Desc",
            description_en: "Desc EN",
            type: 2,
            competencies_count: 22,
            user_status: "completed",
            last_score: 91,
          },
          {
            id: 100,
            name_pt: "Perfil Pendente",
            name_en: "Pending Profile",
            description_pt: "Desc",
            description_en: null,
            type: 3,
            competencies_count: 3,
            user_status: "pending",
            last_score: null,
          },
          {
            id: 101,
            name_pt: "Perfil Não Feito",
            name_en: "",
            description_pt: "Desc",
            description_en: null,
            type: 1,
            competencies_count: 0,
            user_status: "not_done",
            last_score: null,
          },
        ],
        meta: {
          pagination: { current_page: 1, per_page: 9, total: 3, last_page: 1, has_next_page: false },
        },
      })
    );

    const result = await getCatalogAssessments({ page: 1, limit: 9, locale: "en" });

    expect(result.items.map((item) => [item.status, item.score])).toEqual([
      ["completed", 91],
      ["in_progress", undefined],
      ["not_started", undefined],
    ]);
    // 20 segundos por competência, arredondado para cima em minutos
    expect(result.items[0]).toMatchObject({ competenciesCount: 22, estimatedMinutes: 8 });
    expect(result.items[1]).toMatchObject({ competenciesCount: 3, estimatedMinutes: 1, domain: "joint" });
    // Sem competências, a quantidade e o tempo ficam ocultos
    expect(result.items[2]).toMatchObject({ competenciesCount: undefined, estimatedMinutes: undefined });
    // Em inglês, com o português quando falta a tradução
    expect(result.items.map((item) => [item.title, item.description])).toEqual([
      ["Completed Profile", "Desc EN"],
      ["Pending Profile", "Desc"],
      ["Perfil Não Feito", "Desc"],
    ]);
  });

  it("deve enviar à API a página, a busca e os filtros de domínio e situação", async () => {
    const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [],
        meta: {
          pagination: { current_page: 2, per_page: 9, total: 10, last_page: 2, has_next_page: false },
        },
      })
    );

    const result = await getCatalogAssessments({
      page: 2,
      limit: 9,
      search: "  Encarregado ",
      domains: ["privacy", "joint"],
      statuses: ["completed", "in_progress", "not_started"],
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/journey-profiles",
        params: {
          page: 2,
          per_page: 9,
          search: "Encarregado",
          "domains[]": [1, 3],
          "user_status[]": ["completed", "pending", "not_done"],
        },
      })
    );
    expect(result).toMatchObject({ total: 10, page: 2, limit: 9, totalPages: 2 });
  });

  it("não deve enviar a busca vazia nem filtros sem seleção", async () => {
    const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [],
        meta: {
          pagination: { current_page: 1, per_page: 9, total: 0, last_page: 0, has_next_page: false },
        },
      })
    );

    const result = await getCatalogAssessments({ search: "   ", domains: [], statuses: [] });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ params: { page: 1, per_page: 9 } })
    );
    expect(result.totalPages).toBe(1);
  });

  it("não deve usar dados fictícios quando a rede falha", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      new AxiosError("Network Error", "ERR_NETWORK")
    );

    await expect(getCatalogAssessments()).rejects.toThrow("Erro ao carregar o catálogo de jornadas.");
  });

  it("deve completar a jornada pendente com as competências e o tempo do perfil", async () => {
    const profileSpy = vi.spyOn(journeyProfileService, "getJourneyProfile").mockResolvedValue({
      id: 1,
      name_pt: "Encarregado",
      name_en: "DPO",
      description_pt: null,
      description_en: null,
      type: 1,
      competencies_count: 30,
    });
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 10,
            user_id: 2,
            journey_profile: {
              id: 1,
              name_pt: "Encarregado",
              name_en: "DPO",
              description_pt: null,
              description_en: null,
              knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
            },
            status: "ongoing",
            is_completed: false,
          },
        ],
        meta: { pagination: { current_page: 1, per_page: 1, total: 1, last_page: 1 } },
      })
    );

    const result = await getPendingAssessments({ userId: 2, perPage: 1 });

    expect(profileSpy).toHaveBeenCalledWith("1");
    expect(result.items[0]).toMatchObject({ id: "10", competenciesCount: 30, estimatedMinutes: 10 });
  });

  it("deve lançar erro quando a resposta HTTP for status de erro (ex: 500)", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(500, { message: "Erro interno no servidor" })
    );

    await expect(getPendingAssessments({ userId: 1 })).rejects.toThrow(
      "Erro interno no servidor"
    );
  });

  it("deve usar a descrição como título quando o nome for ausente", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [
          {
            id: 20,
            user_id: 2,
            journey_profile: {
              id: 1,
              name_pt: null,
              name_en: null,
              description_pt: "Especialista em Proteção de Dados",
              description_en: null,
              knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
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

  describe("cancelPendingJourney", () => {
    beforeEach(() => {
      clearCsrfToken();
    });

    it("chama POST /journeys/{journey}/cancel com o token CSRF", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-1" } }))
        .mockResolvedValueOnce(mockResponse({ success: true, data: { id: 10, status: "cancelled" } }));

      await cancelPendingJourney("10");

      expect(requestSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: "/journeys/10/cancel",
          method: "post",
          headers: expect.objectContaining({ "X-CSRF-TOKEN": "token-1" }),
        })
      );
    });

    it("propaga o 409 de cancelamento não permitido", async () => {
      vi.spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-1" } }))
        .mockRejectedValueOnce(
          mockAxiosError(409, {
            success: false,
            message: "Esta jornada nao pode ser cancelada.",
            errors: [],
            code: "JOURNEY_CANCELLATION_NOT_ALLOWED",
          })
        );

      await expect(cancelPendingJourney("10")).rejects.toMatchObject({
        status: 409,
        code: "JOURNEY_CANCELLATION_NOT_ALLOWED",
      });
    });
  });
});
