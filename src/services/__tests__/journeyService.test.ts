import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import {
  createJourney,
  getCurrentJourney,
  getJourney,
  mapKnowledgeDomain,
  JourneyRequestError,
} from "../journeyService";
import * as httpClient from "../httpClient";
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

function mockAxiosError(status: number): AxiosError {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      data: { success: false, message: "Erro" },
      status,
      statusText: "",
      headers: {},
      config: {} as AxiosResponse["config"],
    } as AxiosResponse
  );
}

const journeyDetail = {
  id: 10,
  journey_profile: {
    id: 2,
    name_pt: "Encarregado de Dados",
    name_en: "Data Protection Officer",
    knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
  },
  status: "ongoing" as const,
};

describe("journeyService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar GET /journeys/{journey} e desembrulhar o envelope", async () => {
    const getSpy = vi
      .spyOn(axiosInstance, "get")
      .mockResolvedValue(mockResponse({ success: true, data: journeyDetail }));

    const result = await getJourney("10");

    expect(getSpy).toHaveBeenCalledWith("/journeys/10");
    expect(result).toEqual(journeyDetail);
  });

  it.each([403, 404, 422])(
    "deve lançar erro do tipo not_found quando o backend responder %i",
    async (status) => {
      vi.spyOn(axiosInstance, "get").mockRejectedValue(mockAxiosError(status));

      await expect(getJourney("10")).rejects.toMatchObject({
        name: "JourneyRequestError",
        type: "not_found",
      });
    }
  );

  it("deve lançar erro do tipo server_error em falhas 5xx ou de rede", async () => {
    vi.spyOn(axiosInstance, "get").mockRejectedValueOnce(mockAxiosError(500));
    await expect(getJourney("10")).rejects.toMatchObject({ type: "server_error" });

    vi.spyOn(axiosInstance, "get").mockRejectedValueOnce(new Error("Network Error"));
    const error = await getJourney("10").catch((e) => e);
    expect(error).toBeInstanceOf(JourneyRequestError);
    expect(error.type).toBe("server_error");
  });

  it("deve mapear knowledge_domain.id para o domínio da jornada", () => {
    expect(mapKnowledgeDomain({ id: 1, name_pt: "", name_en: "" })).toBe("privacy");
    expect(mapKnowledgeDomain({ id: 2, name_pt: "", name_en: "" })).toBe("security");
    expect(mapKnowledgeDomain({ id: 3, name_pt: "", name_en: "" })).toBe("joint");
    expect(mapKnowledgeDomain({ id: 99, name_pt: "", name_en: "" })).toBeNull();
    expect(mapKnowledgeDomain(null)).toBeNull();
  });

  describe("getCurrentJourney", () => {
    it("deve localizar a jornada em andamento pela listagem e buscar o detalhe", async () => {
      const listSpy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue([{ id: 10 }]);
      const getSpy = vi
        .spyOn(axiosInstance, "get")
        .mockResolvedValue(mockResponse({ success: true, data: journeyDetail }));

      const result = await getCurrentJourney(2);

      expect(listSpy).toHaveBeenCalledWith(
        "/users/2/journeys",
        { params: { status: "ongoing", page: 1, per_page: 1 } },
        expect.any(String)
      );
      expect(getSpy).toHaveBeenCalledWith("/journeys/10");
      expect(result).toEqual(journeyDetail);
    });

    it("deve lançar not_found quando o usuário não tiver jornada em andamento", async () => {
      vi.spyOn(httpClient, "apiRequest").mockResolvedValue([]);

      await expect(getCurrentJourney(2)).rejects.toMatchObject({
        name: "JourneyRequestError",
        type: "not_found",
      });
    });

    it("deve lançar server_error quando a listagem falhar", async () => {
      vi.spyOn(httpClient, "apiRequest").mockRejectedValue(new Error("Network Error"));

      await expect(getCurrentJourney(2)).rejects.toMatchObject({ type: "server_error" });
    });
  });

  describe("createJourney", () => {
    it("deve criar a jornada do perfil com POST e CSRF", async () => {
      const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue({ id: 79 });

      const result = await createJourney(2, 1);

      expect(result).toEqual({ id: 79 });
      expect(spy).toHaveBeenCalledWith(
        "/users/2/journeys",
        { method: "post", data: { journey_profile_id: 1 }, withCsrf: true },
        expect.any(String)
      );
    });

    it("deve propagar o 409 de jornada já em andamento como ApiRequestError", async () => {
      vi.spyOn(httpClient, "apiRequest").mockRejectedValue(
        new httpClient.ApiRequestError("Voce ja possui uma jornada em andamento.", 409, "JOURNEY_IN_PROGRESS")
      );

      await expect(createJourney(2, 1)).rejects.toMatchObject({
        status: 409,
        code: "JOURNEY_IN_PROGRESS",
      });
    });
  });
});
