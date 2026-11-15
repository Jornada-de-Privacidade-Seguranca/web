import { describe, it, expect, vi, beforeEach } from "vitest";
import * as httpClient from "../httpClient";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import {
  downloadJourneyResultPdf,
  getJourneyResult,
  JourneyResultRequestError,
} from "../journeyResultService";

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

describe("downloadJourneyResultPdf", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function pdfResponse(headers: Record<string, string>): AxiosResponse<Blob> {
    return {
      data: new Blob(["%PDF"], { type: "application/pdf" }),
      status: 200,
      statusText: "OK",
      headers: new AxiosHeaders(headers),
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse<Blob>;
  }

  it("deve pedir o PDF no idioma informado e usar o nome do Content-Disposition", async () => {
    const get = vi
      .spyOn(httpClient.axiosInstance, "get")
      .mockResolvedValue(pdfResponse({ "content-disposition": 'attachment; filename="resultado-jornada-10-2026-11-09.pdf"' }));

    const file = await downloadJourneyResultPdf("10", "en");

    expect(get).toHaveBeenCalledWith(
      "/journeys/10/pdf",
      expect.objectContaining({ params: { locale: "en" }, responseType: "blob" })
    );
    expect(file.filename).toBe("resultado-jornada-10-2026-11-09.pdf");
    expect(file.blob.type).toBe("application/pdf");
  });

  it("deve usar resultado-jornada-{id}.pdf quando o cabeçalho não vier", async () => {
    vi.spyOn(httpClient.axiosInstance, "get").mockResolvedValue(pdfResponse({}));

    const file = await downloadJourneyResultPdf("10", "pt");

    expect(file.filename).toBe("resultado-jornada-10.pdf");
  });

  it.each([401, 403, 404, 409, 500])("deve lançar ApiRequestError com o status %s", async (status) => {
    const error = new AxiosError("Erro", "ERR_BAD_RESPONSE", undefined, undefined, {
      status,
      data: new Blob(["{}"]),
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse);
    vi.spyOn(httpClient.axiosInstance, "get").mockRejectedValue(error);

    const thrown = await downloadJourneyResultPdf("10", "pt").catch((err: unknown) => err);

    expect(thrown).toBeInstanceOf(httpClient.ApiRequestError);
    expect((thrown as httpClient.ApiRequestError).status).toBe(status);
  });
});
