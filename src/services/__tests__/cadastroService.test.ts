import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser } from "../cadastroService";
import type { CadastroPayload } from "@features/cadastro/cadastro.types";

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

    const globalFetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as unknown as Response);

    const result = await registerUser(mockPayload);

    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(mockPayload),
      })
    );
    expect(result.id).toBe("usr_123");
    expect(result.email).toBe("maria@empresa.com");
  });

  it("should throw error message from server when response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        message: "E-mail já cadastrado.",
      }),
    } as unknown as Response);

    await expect(registerUser(mockPayload)).rejects.toThrow("E-mail já cadastrado.");
  });

  it("should throw fallback error message when response body is not json or missing message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as Response);

    await expect(registerUser(mockPayload)).rejects.toThrow(
      "Erro ao realizar cadastro do usuário."
    );
  });
});
