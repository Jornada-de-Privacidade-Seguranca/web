import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { getDashboardData, getDashboardMetrics } from "../dashboardService";
import { ApiRequestError, axiosInstance } from "../httpClient";
import type {
  DashboardJourneyApi,
  DashboardJourneysApi,
  UserJourneyListItemApi,
} from "@features/painel/painel.types";

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
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    data,
    status,
    statusText: "",
    headers: {},
    config: {} as AxiosResponse["config"],
  } as AxiosResponse);
}

function journey(id: number, overrides: Partial<DashboardJourneyApi> = {}): DashboardJourneyApi {
  return {
    id,
    status: "completed",
    started_at: "2026-09-29 20:11:09",
    finished_at: "2026-10-27 04:27:26",
    journey_profile: {
      id: 1,
      name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
      name_en: "Data Protection Officer",
      description_pt: "Descrição em português",
      description_en: "Description in English",
    },
    ...overrides,
  };
}

function listItem(
  id: number,
  overrides: Partial<UserJourneyListItemApi> = {}
): UserJourneyListItemApi {
  return {
    id,
    status: "completed",
    score: 80,
    summary: { acquired_knowledges_count: 10 },
    ...overrides,
  };
}

interface ApiMocks {
  journeys?: Partial<DashboardJourneysApi>;
  list?: UserJourneyListItemApi[];
  competenciesCount?: number | null;
}

/** Responde /dashboard e /users/{user}/journeys pelo request, e o perfil pelo get. */
function mockApi({ journeys = {}, list = [], competenciesCount = 10 }: ApiMocks = {}) {
  const requestSpy = vi.spyOn(axiosInstance, "request").mockImplementation(async (config) => {
    if (config.url === "/dashboard") {
      return mockResponse({
        success: true,
        data: {
          journeys: {
            has_unfinished_journey: Boolean(journeys.unfinished_journey),
            unfinished_journey: null,
            latest_journey: null,
            recent_journeys: [],
            ...journeys,
          },
        },
      });
    }
    return mockResponse({ success: true, data: list, meta: {} });
  });
  const getSpy = vi
    .spyOn(axiosInstance, "get")
    .mockResolvedValue(
      mockResponse({ success: true, data: { id: 1, competencies_count: competenciesCount } })
    );
  return { requestSpy, getSpy };
}

const ongoing = journey(84, { status: "in_progress", finished_at: null });

describe("dashboardService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getDashboardData", () => {
    it("deve buscar o painel e as jornadas do usuário, com 5 itens por página", async () => {
      const { requestSpy } = mockApi();

      await getDashboardData(2, "pt");

      expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({ url: "/dashboard" }));
      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ url: "/users/2/journeys", params: { per_page: 5 } })
      );
    });

    it("deve cruzar a nota da listagem com a última concluída e o histórico pelo id", async () => {
      mockApi({
        journeys: {
          latest_journey: journey(83),
          recent_journeys: [journey(80, { finished_at: "2026-10-01 10:00:00" })],
        },
        list: [listItem(80, { score: 64.6 }), listItem(83, { score: 76.4 })],
      });

      const data = await getDashboardData(2, "pt");

      expect(data.lastCompleted).toEqual({
        id: "83",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        completedAt: "2026-10-27 04:27:26",
        score: 76,
      });
      expect(data.history).toEqual([
        {
          id: "80",
          title: "Encarregado pelo Tratamento de Dados Pessoais",
          completedAt: "2026-10-01 10:00:00",
          score: 65,
        },
      ]);
    });

    it("deve limitar a nota a 100", async () => {
      mockApi({
        journeys: { latest_journey: journey(83) },
        list: [listItem(83, { score: 125.22 })],
      });

      const data = await getDashboardData(2, "pt");

      expect(data.lastCompleted?.score).toBe(100);
    });

    it("deve deixar a nota nula quando a jornada não estiver na listagem", async () => {
      mockApi({
        journeys: { latest_journey: journey(83), recent_journeys: [journey(10)] },
        list: [listItem(83)],
      });

      const data = await getDashboardData(2, "pt");

      expect(data.lastCompleted?.score).toBe(80);
      expect(data.history[0].score).toBeNull();
    });

    it("deve marcar como não iniciada a jornada em andamento sem competências respondidas", async () => {
      const { getSpy } = mockApi({
        journeys: { unfinished_journey: ongoing },
        list: [listItem(84, { status: "ongoing", score: null, summary: { acquired_knowledges_count: 0 } })],
      });

      const data = await getDashboardData(2, "pt");

      expect(getSpy).toHaveBeenCalledWith("/journey-profiles/1");
      expect(data.pending).toEqual({
        id: "84",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        description: "Descrição em português",
        status: "pending",
        totalQuestions: 10,
        estimatedMinutes: 4,
      });
    });

    it("deve marcar como iniciada a jornada em andamento com competências respondidas", async () => {
      mockApi({
        journeys: { unfinished_journey: ongoing },
        list: [listItem(84, { status: "ongoing", score: null, summary: { acquired_knowledges_count: 3 } })],
      });

      const data = await getDashboardData(2, "pt");

      expect(data.pending?.status).toBe("in_progress");
    });

    it("deve tratar como não iniciada a jornada em andamento fora da listagem", async () => {
      mockApi({ journeys: { unfinished_journey: ongoing }, list: [] });

      const data = await getDashboardData(2, "pt");

      expect(data.pending?.status).toBe("pending");
    });

    it("deve deixar perguntas e tempo nulos quando o perfil não informar as competências", async () => {
      mockApi({ journeys: { unfinished_journey: ongoing }, competenciesCount: null });

      const data = await getDashboardData(2, "pt");

      expect(data.pending?.totalQuestions).toBeNull();
      expect(data.pending?.estimatedMinutes).toBeNull();
    });

    it("deve usar os textos em inglês quando o idioma for en", async () => {
      mockApi({
        journeys: { unfinished_journey: ongoing, latest_journey: journey(83) },
        list: [listItem(83)],
      });

      const data = await getDashboardData(2, "en");

      expect(data.pending?.title).toBe("Data Protection Officer");
      expect(data.pending?.description).toBe("Description in English");
      expect(data.lastCompleted?.title).toBe("Data Protection Officer");
    });

    it("deve usar o texto em português quando faltar o texto em inglês", async () => {
      mockApi({
        journeys: {
          latest_journey: journey(83, {
            journey_profile: {
              id: 1,
              name_pt: "Controlador",
              name_en: null,
              description_pt: null,
              description_en: null,
            },
          }),
        },
        list: [listItem(83)],
      });

      const data = await getDashboardData(2, "en");

      expect(data.lastCompleted?.title).toBe("Controlador");
    });

    it("deve retornar o painel vazio para usuário sem jornadas, sem buscar o perfil", async () => {
      const { getSpy } = mockApi();

      const data = await getDashboardData(2, "pt");

      expect(data).toEqual({ pending: null, lastCompleted: null, history: [] });
      expect(getSpy).not.toHaveBeenCalled();
    });

    it("deve propagar o 403 de conta não ativada com a mensagem e o code da API", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValue(
        mockAxiosError(403, {
          success: false,
          message: "Sua conta ainda não foi ativada.",
          code: "ACCOUNT_NOT_ACTIVATED",
        })
      );

      const error = await getDashboardData(2, "pt").catch((err: unknown) => err);

      expect(error).toBeInstanceOf(ApiRequestError);
      expect(error).toMatchObject({
        status: 403,
        code: "ACCOUNT_NOT_ACTIVATED",
        message: "Sua conta ainda não foi ativada.",
      });
    });

    it("deve falhar quando a listagem de jornadas falhar", async () => {
      vi.spyOn(axiosInstance, "request").mockImplementation(async (config) => {
        if (config.url === "/dashboard") {
          return mockResponse({
            success: true,
            data: {
              journeys: {
                has_unfinished_journey: false,
                unfinished_journey: null,
                latest_journey: null,
                recent_journeys: [],
              },
            },
          });
        }
        throw mockAxiosError(500, { success: false, message: "Erro interno" });
      });

      await expect(getDashboardData(2, "pt")).rejects.toMatchObject({ status: 500 });
    });
  });

  describe("getDashboardMetrics", () => {
    it("deve mapear o resumo das métricas e arredondar a média", async () => {
      const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: {
            summary: {
              total_journeys: 5,
              completed_journeys: 3,
              ongoing_journeys: 1,
              average_score: 71.6,
              highest_score: 90,
              latest_score: 70,
            },
            domains: [],
          },
        })
      );

      const metrics = await getDashboardMetrics(2);

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ url: "/users/2/journeys/metrics" })
      );
      expect(metrics).toEqual({ completedJourneys: 3, pendingJourneys: 1, averageScore: 72 });
    });

    it("deve usar média 0 quando o usuário não tiver nota", async () => {
      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: { summary: { completed_journeys: 0, ongoing_journeys: 0, average_score: null } },
        })
      );

      const metrics = await getDashboardMetrics(2);

      expect(metrics.averageScore).toBe(0);
    });

    it("deve propagar a falha do endpoint de métricas", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(404, { success: false, message: "Not found" })
      );

      await expect(getDashboardMetrics(2)).rejects.toMatchObject({ status: 404 });
    });
  });
});
