import { describe, it, expect, vi, beforeEach } from "vitest";
import * as httpClient from "../httpClient";
import { getJourneyResult, JourneyResultRequestError } from "../journeyResultService";

describe("journeyResultService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar a jornada pelo id", async () => {
    const journey = { id: 10, status: "completed" };
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue(journey);

    expect(await getJourneyResult("10")).toBe(journey);
    expect(spy).toHaveBeenCalledWith(
      "/journeys/10",
      {},
      "Não foi possível carregar o resultado da jornada."
    );
  });

  it.each([
    [404, "JOURNEY_NOT_FOUND", "not_found"],
    [403, "JOURNEY_FORBIDDEN", "forbidden"],
    [409, "INCOMPLETE_JOURNEY", "incomplete"],
    [422, "VALIDATION_ERROR", "not_found"],
    [500, "JOURNEY_SEARCH_FAILED", "server_error"],
  ] as const)("deve converter o status %s (%s) no erro %s", async (status, code, type) => {
    vi.spyOn(httpClient, "apiRequest").mockRejectedValue(
      new httpClient.ApiRequestError("Erro", status, code)
    );

    const error = await getJourneyResult("10").catch((err: unknown) => err);

    expect(error).toBeInstanceOf(JourneyResultRequestError);
    expect((error as JourneyResultRequestError).type).toBe(type);
  });

  it("deve tratar falha de rede como erro de servidor", async () => {
    vi.spyOn(httpClient, "apiRequest").mockRejectedValue(new httpClient.ApiRequestError("Network"));

    await expect(getJourneyResult("10")).rejects.toMatchObject({ type: "server_error" });
  });
});
