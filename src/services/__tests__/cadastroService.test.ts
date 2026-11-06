import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { CadastroRequestError, registerUser } from "../cadastroService";
import { axiosInstance } from "../httpClient";
import type { CadastroFormData } from "@features/cadastro/cadastro.types";

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

  const formData: CadastroFormData = {
    nomeCompleto: "Maria Silva",
    codigoFuncionario: "00123456",
    departamento: "Tecnologia",
    empresa: "ACME Corp",
    email: "maria@empresa.com",
    senha: "Password123!",
    confirmarSenha: "Password123!",
  };

  const createdUser = {
    id: 7,
    name: "Maria Silva",
    email: "maria@empresa.com",
    organization_company: "ACME Corp",
    department: "Tecnologia",
    registration_number: "00123456",
    profile_type_id: 3,
    journey_profile_id: null,
    active_status: 2,
    account_status: "pending_activation",
    created_at: "2026-11-06 10:00:00",
  };

  async function captureError(promise: Promise<unknown>): Promise<CadastroRequestError> {
    try {
      await promise;
    } catch (err) {
      expect(err).toBeInstanceOf(CadastroRequestError);
      return err as CadastroRequestError;
    }
    throw new Error("A requisição deveria falhar.");
  }

  it("deve enviar os campos com os nomes da API, sem o perfil de acesso", async () => {
    const requestSpy = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(mockResponse({ success: true, message: "ok", data: createdUser }));

    const result = await registerUser(formData);

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "post",
        url: "/auth/register",
        data: {
          name: "Maria Silva",
          email: "maria@empresa.com",
          password: "Password123!",
          password_confirmation: "Password123!",
          organization: "ACME Corp",
          department: "Tecnologia",
          registration_number: "00123456",
        },
      })
    );
    const sent = requestSpy.mock.calls[0][0].data as Record<string, unknown>;
    expect(sent).not.toHaveProperty("profile_type_id");
    expect(result).toEqual(createdUser);
  });

  it("deve converter as mensagens do 422 para os campos do formulário", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(422, {
        success: false,
        message: "Validation error.",
        code: "VALIDATION_ERROR",
        errors: {
          name: ["Informe nome e sobrenome."],
          password: ["A confirmacao da senha nao confere."],
          organization: ["Informe o orgao ou empresa."],
          department: ["Informe o setor."],
          registration_number: ["Informe a matricula."],
          journey_profile_id: ["Informe um perfil de jornada valido."],
        },
      })
    );

    const error = await captureError(registerUser(formData));

    expect(error.type).toBe("validation");
    expect(error.fieldErrors).toEqual({
      nomeCompleto: "Informe nome e sobrenome.",
      senha: "A confirmacao da senha nao confere.",
      empresa: "Informe o orgao ou empresa.",
      departamento: "Informe o setor.",
      codigoFuncionario: "Informe a matricula.",
    });
    expect(error.otherErrors).toEqual(["Informe um perfil de jornada valido."]);
  });

  it("deve identificar o e-mail já cadastrado pelo 409", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
      mockAxiosError(409, {
        success: false,
        message: "Ja existe uma conta cadastrada com este e-mail.",
        code: "ACCOUNT_ALREADY_EXISTS",
      })
    );

    const error = await captureError(registerUser(formData));

    expect(error.type).toBe("already_registered");
    expect(error.message).toBe("Ja existe uma conta cadastrada com este e-mail.");
  });

  it.each([
    [500, null],
    [429, { success: false, message: "Too Many Attempts." }],
  ])("deve tratar o status %i como erro geral", async (status, data) => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(mockAxiosError(status, data));

    const error = await captureError(registerUser(formData));

    expect(error.type).toBe("server_error");
  });

  it("deve tratar a falha de rede como erro geral", async () => {
    vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(new Error("Network Error"));

    const error = await captureError(registerUser(formData));

    expect(error.type).toBe("server_error");
  });
});
