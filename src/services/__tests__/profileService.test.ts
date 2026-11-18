import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { getOwnProfile, getProfileActivity, updateOwnProfile } from "../profileService";
import { ApiRequestError, axiosInstance, clearCsrfToken } from "../httpClient";

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

const ME = {
  id: 21,
  name: "Ana Souza",
  email: "ana@example.com",
  organization: "Instituto Exemplo",
  department: "Privacidade",
  registration_number: "E-21",
  created_at: "2026-07-20 10:00:00",
  role: "common_user",
  profile: { role: "common_user", label: "Usuario comum", permissions: [] },
  active_status: 1,
};

describe("profileService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearCsrfToken();
  });

  describe("getOwnProfile", () => {
    it("busca o /me e converte para os campos da tela", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: ME }));

      const profile = await getOwnProfile();

      expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({ url: "/me" }));
      expect(profile).toEqual({
        name: "Ana Souza",
        organization: "Instituto Exemplo",
        email: "ana@example.com",
        employeeCode: "E-21",
        department: "Privacidade",
      });
    });

    it("usa texto vazio nos campos que a conta ainda não tem", async () => {
      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: { ...ME, organization: null, department: null, registration_number: null },
        })
      );

      const profile = await getOwnProfile();

      expect(profile).toMatchObject({ organization: "", department: "", employeeCode: "" });
    });

    it("propaga o erro da API", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(500, { success: false, message: "Erro interno" })
      );

      await expect(getOwnProfile()).rejects.toMatchObject({ status: 500, message: "Erro interno" });
    });
  });

  describe("getProfileActivity", () => {
    it("busca as métricas do usuário e monta o resumo por domínio", async () => {
      const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: {
            user_id: 21,
            summary: { total_journeys: 5, completed_journeys: 4, ongoing_journeys: 1, average_score: 71 },
            domains: [
              { domain_id: 1, average_score: 78.5 },
              { domain_id: 2, average_score: 60 },
              { domain_id: 3, average_score: null },
            ],
          },
        })
      );

      const activity = await getProfileActivity(21);

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ url: "/users/21/journeys/metrics" })
      );
      expect(activity).toEqual({
        completedJourneys: 4,
        inProgressJourneys: 1,
        averageByDomain: { privacy: 78.5, security: 60, combined: null },
      });
    });

    it("deixa sem média os domínios que não vieram na resposta", async () => {
      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: { summary: { completed_journeys: 0, ongoing_journeys: 0 }, domains: [] },
        })
      );

      const activity = await getProfileActivity(21);

      expect(activity.averageByDomain).toEqual({ privacy: null, security: null, combined: null });
    });
  });

  describe("updateOwnProfile", () => {
    it("envia só os campos informados no PATCH /me, com o token CSRF", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-1" } }))
        .mockResolvedValueOnce(
          mockResponse({ success: true, data: { ...ME, name: "Ana Silva", department: "Segurança" } })
        );

      const profile = await updateOwnProfile({ name: "Ana Silva", department: "Segurança" });

      expect(requestSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: "/me",
          method: "patch",
          data: { name: "Ana Silva", department: "Segurança" },
          headers: expect.objectContaining({ "X-CSRF-TOKEN": "token-1" }),
        })
      );
      expect(profile).toMatchObject({ name: "Ana Silva", department: "Segurança", employeeCode: "E-21" });
    });

    it("propaga o 422 com os erros por campo", async () => {
      vi.spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-1" } }))
        .mockRejectedValueOnce(
          mockAxiosError(422, {
            success: false,
            message: "Validation error.",
            code: "VALIDATION_ERROR",
            errors: { name: ["Informe nome e sobrenome."] },
          })
        );

      const error = await updateOwnProfile({ name: "Ana" }).catch((err: unknown) => err);

      expect(error).toBeInstanceOf(ApiRequestError);
      expect(error).toMatchObject({
        status: 422,
        code: "VALIDATION_ERROR",
        errors: { name: ["Informe nome e sobrenome."] },
      });
    });

    it("propaga o 409 de e-mail já usado", async () => {
      vi.spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-1" } }))
        .mockRejectedValueOnce(
          mockAxiosError(409, {
            success: false,
            message: "Ja existe uma conta cadastrada com este e-mail.",
            code: "EMAIL_ALREADY_IN_USE",
            errors: { email: ["Informe outro e-mail."] },
          })
        );

      await expect(updateOwnProfile({ email: "outra@example.com" })).rejects.toMatchObject({
        status: 409,
        code: "EMAIL_ALREADY_IN_USE",
      });
    });
  });
});
