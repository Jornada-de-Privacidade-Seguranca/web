import { describe, it, expect, vi, beforeEach } from "vitest";
import * as httpClient from "../httpClient";
import {
  getCertificationOptions,
  getSelectedCertifications,
  saveSelectedCertifications,
} from "../certificationsService";

const certification = {
  id: 1,
  name: "CIPP/E",
  issuer: "IAPP",
  knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
};

const selection = {
  journey_id: 10,
  status: "ongoing",
  is_complete: true,
  certifications: [certification],
};

describe("certificationsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar as certificações disponíveis", async () => {
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue([certification]);

    const result = await getCertificationOptions();

    expect(result).toEqual([certification]);
    expect(spy).toHaveBeenCalledWith(
      "/journeys/current/certifications/options",
      {},
      expect.any(String)
    );
  });

  it("deve extrair a lista de certificações do objeto da seleção salva", async () => {
    const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue(selection);

    const result = await getSelectedCertifications();

    expect(result).toEqual([certification]);
    expect(spy).toHaveBeenCalledWith(
      "/journeys/current/certifications",
      {},
      expect.any(String)
    );
  });

  it("deve salvar com PUT, CSRF e certification_ids (inclusive lista vazia)", async () => {
    const spy = vi
      .spyOn(httpClient, "apiRequest")
      .mockResolvedValueOnce(selection)
      .mockResolvedValueOnce({ ...selection, certifications: [] });

    expect(await saveSelectedCertifications([1, 4])).toEqual([certification]);
    expect(await saveSelectedCertifications([])).toEqual([]);

    expect(spy).toHaveBeenNthCalledWith(
      1,
      "/journeys/current/certifications",
      { method: "put", data: { certification_ids: [1, 4] }, withCsrf: true },
      expect.any(String)
    );
    expect(spy).toHaveBeenNthCalledWith(
      2,
      "/journeys/current/certifications",
      { method: "put", data: { certification_ids: [] }, withCsrf: true },
      expect.any(String)
    );
  });
});
