import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { registerUser } from "../cadastroService";
import { axiosInstance } from "../httpClient";
import type { CadastroPayload } from "@features/cadastro/cadastro.types";

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

describe("cadastroService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockPayload: CadastroPayload = {
    nomeCompleto: "Maria Silva",
    codigoFuncionario: "00123456",
    departamento: "Tecnologia",
    empresa: "ACME Corp",
    email: "maria@empresa.com",
    senha: "Password123!",
  };

  it("should successfully register a user and unwrap response data from envelope", async () => {
    const mockApiResponse = {
      success: true,
      message: "Usuário cadastrado com sucesso",
      data: {
        id: "usr_123",
        nomeCompleto: "Maria Silva",
        email: "maria@empresa.com",
        codigoFuncionario: "00123456",
        departamento: "Tecnologia",
        empresa: "ACME Corp",
      },
    };

    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(mockResponse(mockApiResponse));

    const result = await registerUser(mockPayload);

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "post",
        url: "/auth/register",
        data: mockPayload,
      })
    );
    expect(result.id).toBe("usr_123");
    expect(result.email).toBe("maria@empresa.com");
  });

  it("should throw error message from server when response is not ok", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(409, {
        success: false,
        message: "E-mail já cadastrado.",
      })
    );

    await expect(registerUser(mockPayload)).rejects.toThrow("E-mail já cadastrado.");
  });

  it("should throw fallback error message when response body has no message", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(500, null)
    );

    await expect(registerUser(mockPayload)).rejects.toThrow(
      "Erro ao realizar cadastro do usuário."
    );
  });

  it("should throw the envelope message when response.ok is true but success is false", async () => {
    vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
      mockResponse({
        success: false,
        message: "Cadastro rejeitado pelas regras de negócio.",
        data: null,
      })
    );

    await expect(registerUser(mockPayload)).rejects.toThrow(
      "Cadastro rejeitado pelas regras de negócio."
    );
  });
});
