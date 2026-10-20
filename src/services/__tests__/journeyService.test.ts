import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import {
  getJourney,
  mapKnowledgeDomain,
  JourneyRequestError,
} from "../journeyService";
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
});
