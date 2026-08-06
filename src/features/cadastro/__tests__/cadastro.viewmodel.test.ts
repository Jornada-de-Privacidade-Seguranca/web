import { describe, it, expect, vi, beforeEach } from "vitest";
import * as cadastroService from "@services/cadastroService";

// Mock next-intl hook
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("Cadastro ViewModel Logic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should attempt user registration when form is valid", async () => {
    const mockResponse = {
      id: "usr_999",
      nomeCompleto: "Maria Silva",
      email: "maria@empresa.com",
      codigoFuncionario: "00123456",
      departamento: "Tecnologia",
      empresa: "ACME Corp",
    };

    const spy = vi
      .spyOn(cadastroService, "registerUser")
      .mockResolvedValueOnce(mockResponse);

    const payload = {
      nomeCompleto: "Maria Silva",
      codigoFuncionario: "00123456",
      departamento: "Tecnologia",
      empresa: "ACME Corp",
      email: "maria@empresa.com",
      senha: "Password123!",
    };

    const result = await cadastroService.registerUser(payload);

    expect(spy).toHaveBeenCalledWith(payload);
    expect(result.id).toBe("usr_999");
  });

  it("should handle error when email or employee code is already registered", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new Error("E-mail já cadastrado.")
    );

    const payload = {
      nomeCompleto: "Maria Silva",
      codigoFuncionario: "00123456",
      departamento: "Tecnologia",
      empresa: "ACME Corp",
      email: "maria@empresa.com",
      senha: "Password123!",
    };

    await expect(cadastroService.registerUser(payload)).rejects.toThrow(
      "E-mail já cadastrado."
    );
  });

  it("should handle internal server error on registration failure", async () => {
    vi.spyOn(cadastroService, "registerUser").mockRejectedValueOnce(
      new Error("Erro de servidor")
    );

    const payload = {
      nomeCompleto: "Maria Silva",
      codigoFuncionario: "00123456",
      departamento: "Tecnologia",
      empresa: "ACME Corp",
      email: "maria@empresa.com",
      senha: "Password123!",
    };

    await expect(cadastroService.registerUser(payload)).rejects.toThrow("Erro de servidor");
  });
});
