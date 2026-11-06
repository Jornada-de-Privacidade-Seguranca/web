import { describe, it, expect, vi, beforeEach } from "vitest";
import * as httpClient from "../httpClient";
import { ApiRequestError } from "../httpClient";
import { selectInitialJourneyProfile } from "../journeyProfileService";

describe("journeyProfileService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("selectInitialJourneyProfile", () => {
    it("deve salvar o perfil de jornada inicial com PUT /me/journey-profile e CSRF", async () => {
      const selected = {
        journey_profile_id: 3,
        journey_profile: {
          id: 3,
          name_pt: "Operador",
          name_en: "Processor",
          description_pt: null,
          description_en: null,
          type: 1,
        },
      };
      const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValueOnce(selected);

      await expect(selectInitialJourneyProfile(3)).resolves.toEqual(selected);
      expect(spy).toHaveBeenCalledWith(
        "/me/journey-profile",
        { method: "put", data: { journey_profile_id: 3 }, withCsrf: true },
        expect.any(String)
      );
    });

    it("deve repassar a falha com o code da API", async () => {
      const error = new ApiRequestError("bloqueado", 409, "JOURNEY_PROFILE_SELECTION_LOCKED");
      vi.spyOn(httpClient, "apiRequest").mockRejectedValueOnce(error);

      await expect(selectInitialJourneyProfile(3)).rejects.toBe(error);
    });
  });
});
