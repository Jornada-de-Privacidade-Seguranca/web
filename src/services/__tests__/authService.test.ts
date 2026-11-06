import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { getAuthenticatedUser, login, logout, renewSession } from "../authService";
import { axiosInstance, clearCsrfToken } from "../httpClient";
import type { AuthenticatedUser } from "@features/auth/auth.types";

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

const mockUser: AuthenticatedUser = {
  id: 1,
  name: "Maria Silva",
  email: "maria.silva@example.com",
  role: "common_user",
  profile: {
    role: "common_user",
    label: "Usuario comum",
    user_type_id: 2,
    profile_type_id: 1,
    profile_type_name: "Aluno",
  },
  active_status: 1,
};

describe("authService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearCsrfToken();
  });

  describe("login", () => {
    it("should fetch a CSRF token, send it in X-CSRF-TOKEN and return the authenticated user", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(
          mockResponse({ success: true, data: { csrf_token: "token-1" } })
        )
        .mockResolvedValueOnce(
          mockResponse({
            success: true,
            message: "Login realizado com sucesso.",
            data: mockUser,
          })
        );

      const result = await login({
        email: "maria.silva@example.com",
        password: "secret123",
      });

      expect(result).toEqual(mockUser);
      expect(requestSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: "/auth/login",
          method: "post",
          data: { email: "maria.silva@example.com", password: "secret123" },
          headers: expect.objectContaining({ "X-CSRF-TOKEN": "token-1" }),
        })
      );
    });

    it("should throw the backend message on invalid credentials (401)", async () => {
      vi.spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(
          mockResponse({ success: true, data: { csrf_token: "token-1" } })
        )
        .mockRejectedValueOnce(
          mockAxiosError(401, {
            success: false,
            message: "Usuário e/ou senha inválidos.",
            code: "INVALID_CREDENTIALS",
          })
        );

      await expect(
        login({ email: "maria.silva@example.com", password: "wrong" })
      ).rejects.toThrow("Usuário e/ou senha inválidos.");
    });
  });

  describe("getAuthenticatedUser", () => {
    it("should return the authenticated user without fetching a CSRF token", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: mockUser }));

      const result = await getAuthenticatedUser();

      expect(result).toEqual(mockUser);
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ url: "/me" })
      );
    });

    it("should throw when there is no authenticated session (401)", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(401, {
          success: false,
          message: "Usuario nao autenticado.",
          code: "UNAUTHENTICATED",
        })
      );

      await expect(getAuthenticatedUser()).rejects.toThrow(
        "Usuario nao autenticado."
      );
    });

    describe("em desenvolvimento", () => {
      beforeEach(() => {
        vi.stubEnv("NODE_ENV", "development");
      });

      afterEach(() => {
        vi.unstubAllEnvs();
      });

      it("should not fall back to the mock user on 401, so session expiry can be tested", async () => {
        vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
          mockAxiosError(401, { success: false, message: "Usuario nao autenticado." })
        );

        await expect(getAuthenticatedUser()).rejects.toThrow("Usuario nao autenticado.");
      });

      it("should fall back to the mock user when the backend does not respond", async () => {
        vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
          new AxiosError("Network Error", "ERR_NETWORK")
        );

        await expect(getAuthenticatedUser()).resolves.toMatchObject({
          name: "Usuário Teste",
        });
      });
    });
  });

  describe("logout", () => {
    it("should send the CSRF token when logging out", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(
          mockResponse({ success: true, data: { csrf_token: "token-1" } })
        )
        .mockResolvedValueOnce(
          mockResponse({ success: true, message: "Logout realizado com sucesso.", data: null })
        );

      await expect(logout()).resolves.toBeUndefined();
      expect(requestSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: "/auth/logout",
          method: "post",
          headers: expect.objectContaining({ "X-CSRF-TOKEN": "token-1" }),
        })
      );
    });
  });

  describe("renewSession", () => {
    it("should call GET /me without fetching a CSRF token", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: mockUser }));

      await expect(renewSession()).resolves.toBeUndefined();
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ url: "/me" })
      );
    });

    it("should not fall back to the mock user in development when the backend does not respond", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        new AxiosError("Network Error", "ERR_NETWORK")
      );

      await expect(renewSession()).rejects.toThrow("Não foi possível renovar a sessão.");
      vi.unstubAllEnvs();
    });
  });
});
