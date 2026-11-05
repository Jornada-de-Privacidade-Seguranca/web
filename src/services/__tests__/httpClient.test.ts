import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import {
  ApiRequestError,
  apiRequest,
  apiRequestWithMeta,
  axiosInstance,
  clearCsrfToken,
  setUnauthorizedHandler,
} from "../httpClient";

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

describe("httpClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearCsrfToken();
  });

  it("should authenticate via session cookie by default", () => {
    expect(axiosInstance.defaults.withCredentials).toBe(true);
  });

  it("should not fetch a CSRF token for GET requests", async () => {
    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(mockResponse({ success: true, data: { foo: "bar" } }));

    const result = await apiRequest<{ foo: string }>("/dashboard/pending");

    expect(result).toEqual({ foo: "bar" });
    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [config] = requestSpy.mock.calls[0];
    expect(
      (config.headers as Record<string, string>)?.["X-CSRF-TOKEN"]
    ).toBeUndefined();
  });

  it("should fetch and attach a CSRF token for mutating requests when withCsrf is true", async () => {
    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(
        mockResponse({ success: true, data: { csrf_token: "token-1" } })
      )
      .mockResolvedValueOnce(mockResponse({ success: true, data: { done: true } }));

    const result = await apiRequest<{ done: boolean }>("/auth/login", {
      method: "post",
      data: { email: "a@a.com", password: "b" },
      withCsrf: true,
    });

    expect(result).toEqual({ done: true });
    expect(requestSpy).toHaveBeenCalledTimes(2);
    expect(requestSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ url: "/auth/csrf-token", method: "get" })
    );
    expect(requestSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        url: "/auth/login",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "token-1" }),
      })
    );
  });

  it("should reuse a cached CSRF token across multiple mutating requests", async () => {
    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(
        mockResponse({ success: true, data: { csrf_token: "token-1" } })
      )
      .mockResolvedValueOnce(mockResponse({ success: true, data: {} }))
      .mockResolvedValueOnce(mockResponse({ success: true, data: {} }));

    await apiRequest("/auth/login", { method: "post", withCsrf: true });
    await apiRequest("/auth/logout", { method: "post", withCsrf: true });

    expect(requestSpy).toHaveBeenCalledTimes(3);
    const csrfCalls = requestSpy.mock.calls.filter(
      ([config]) => config.url === "/auth/csrf-token"
    );
    expect(csrfCalls).toHaveLength(1);
  });

  it("should refresh the CSRF token and retry once when the server rejects it (403/419)", async () => {
    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(
        mockResponse({ success: true, data: { csrf_token: "stale-token" } })
      )
      .mockRejectedValueOnce(
        mockAxiosError(419, { success: false, message: "CSRF token inválido." })
      )
      .mockResolvedValueOnce(
        mockResponse({ success: true, data: { csrf_token: "fresh-token" } })
      )
      .mockResolvedValueOnce(mockResponse({ success: true, data: { done: true } }));

    const result = await apiRequest<{ done: boolean }>("/auth/login", {
      method: "post",
      withCsrf: true,
    });

    expect(result).toEqual({ done: true });
    expect(requestSpy).toHaveBeenCalledTimes(4);
    expect(requestSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "fresh-token" }),
      })
    );
  });

  it("should throw when the retried request still fails after refreshing the token", async () => {
    vi.spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(
        mockResponse({ success: true, data: { csrf_token: "stale-token" } })
      )
      .mockRejectedValueOnce(
        mockAxiosError(419, { success: false, message: "CSRF token inválido." })
      )
      .mockResolvedValueOnce(
        mockResponse({ success: true, data: { csrf_token: "fresh-token" } })
      )
      .mockRejectedValueOnce(
        mockAxiosError(419, { success: false, message: "CSRF token inválido." })
      );

    await expect(
      apiRequest("/auth/login", { method: "post", withCsrf: true })
    ).rejects.toThrow("CSRF token inválido.");
  });

  it("should throw the API message when the request fails without CSRF involvement", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(409, {
        success: false,
        message: "Já existe uma conta cadastrada com este e-mail.",
      })
    );

    await expect(
      apiRequest("/auth/register", { method: "post", data: {} })
    ).rejects.toThrow("Já existe uma conta cadastrada com este e-mail.");
  });

  it("should expose the HTTP status and backend code on ApiRequestError", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(404, {
        success: false,
        message: "Nao existe jornada em andamento para este usuario.",
        code: "ONGOING_JOURNEY_NOT_FOUND",
      })
    );

    const error = await apiRequest<never>("/journeys/current/courses").catch(
      (e: ApiRequestError) => e
    );

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Nao existe jornada em andamento para este usuario.");
    expect(error.status).toBe(404);
    expect(error.code).toBe("ONGOING_JOURNEY_NOT_FOUND");
  });

  it("should throw ApiRequestError without status on network failures", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(new Error("Network Error"));

    const error = await apiRequest<never>("/journeys/current/courses", {}, "Falha padrão.").catch(
      (e: ApiRequestError) => e
    );

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.message).toBe("Falha padrão.");
    expect(error.status).toBeUndefined();
  });

  it("should return data and meta when using apiRequestWithMeta", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: [{ id: 1 }],
        meta: { pagination: { total: 1 } },
      })
    );

    const result = await apiRequestWithMeta<
      Array<{ id: number }>,
      { pagination: { total: number } }
    >("/test-endpoint");

    expect(result).toEqual({
      data: [{ id: 1 }],
      meta: { pagination: { total: 1 } },
    });
  });

  it("should return meta as undefined when response has no meta", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: true,
        data: { message: "ok" },
      })
    );

    const result = await apiRequestWithMeta<{ message: string }>("/test-endpoint");

    expect(result).toEqual({
      data: { message: "ok" },
      meta: undefined,
    });
  });
  describe("401 fora das rotas de autenticação", () => {
    const unauthorizedHandler = vi.fn();
    const originalAdapter = axiosInstance.defaults.adapter;

    /** Responde pelo adaptador, para que a resposta passe pelos interceptadores. */
    function respondWith(statusByUrl: Record<string, { status: number; data: unknown }>) {
      axiosInstance.defaults.adapter = async (config) => {
        const { status, data } = statusByUrl[config.url ?? ""];
        const response = { data, status, statusText: "", headers: {}, config };
        if (status >= 400) {
          throw new AxiosError("Request failed", "ERR_BAD_REQUEST", config, undefined, response as AxiosResponse);
        }
        return response as AxiosResponse;
      };
    }

    beforeEach(() => {
      unauthorizedHandler.mockClear();
      setUnauthorizedHandler(unauthorizedHandler);
    });

    afterEach(() => {
      setUnauthorizedHandler(null);
      axiosInstance.defaults.adapter = originalAdapter;
    });

    it("should notify the unauthorized handler and still reject with the error", async () => {
      respondWith({
        "/journeys/current/competencies": {
          status: 401,
          data: { success: false, message: "Usuario nao autenticado.", code: "UNAUTHENTICATED" },
        },
      });

      await expect(apiRequest("/journeys/current/competencies")).rejects.toMatchObject({
        status: 401,
        code: "UNAUTHENTICATED",
      });
      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
    });

    it("should also notify for services that call axiosInstance directly", async () => {
      respondWith({ "/journeys/2": { status: 401, data: { success: false } } });

      await expect(axiosInstance.get("/journeys/2")).rejects.toBeInstanceOf(AxiosError);
      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
    });

    it("should not notify on 401 from authentication routes (e.g. wrong password)", async () => {
      respondWith({
        "/auth/csrf-token": { status: 200, data: { success: true, data: { csrf_token: "token" } } },
        "/auth/login": {
          status: 401,
          data: { success: false, message: "Credenciais invalidas.", code: "INVALID_CREDENTIALS" },
        },
      });

      await expect(
        apiRequest("/auth/login", { method: "post", withCsrf: true })
      ).rejects.toThrow("Credenciais invalidas.");
      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });

    it("should not notify on other error statuses", async () => {
      respondWith({ "/dashboard": { status: 500, data: { success: false, message: "Erro interno." } } });

      await expect(apiRequest("/dashboard")).rejects.toThrow("Erro interno.");
      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });
  });
});
