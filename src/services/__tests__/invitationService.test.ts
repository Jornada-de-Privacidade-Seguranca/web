import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

import {
  InvitationRequestError,
  completeInvitation,
  toCompleteInvitationPayload,
  toInvitationRequestError,
  validateInvitation,
} from "../invitationService";
import { ApiRequestError, axiosInstance } from "../httpClient";
import type { InitialPasswordFormValues } from "@features/initial-password/initialPassword.types";

const credentials = { email: "ana@exemplo.com", token: "abc" };

const formValues: InitialPasswordFormValues = {
  nomeCompleto: "Ana Souza",
  empresa: "Prefeitura Exemplo",
  departamento: "Tecnologia",
  codigoFuncionario: "00123456",
  senha: "senha-segura",
  confirmarSenha: "senha-segura",
};

function mockResponse<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: "OK", headers: {}, config: {} as AxiosResponse["config"] };
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

function mockRequest(handler: (config: AxiosRequestConfig) => unknown) {
  return vi
    .spyOn(axiosInstance, "request")
    .mockImplementation(async (config) => handler(config) as AxiosResponse);
}

const invalidTokenError = () =>
  mockAxiosError(422, {
    success: false,
    message: "O convite e invalido, expirou ou ja foi utilizado.",
    code: "INVALID_INVITATION_TOKEN",
  });

describe("invitationService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("toCompleteInvitationPayload", () => {
    it("deve converter o formulário para os campos do POST /auth/invitations/complete", () => {
      expect(toCompleteInvitationPayload(credentials, formValues)).toEqual({
        email: "ana@exemplo.com",
        token: "abc",
        name: "Ana Souza",
        organization: "Prefeitura Exemplo",
        department: "Tecnologia",
        registration_number: "00123456",
        password: "senha-segura",
        password_confirmation: "senha-segura",
      });
    });
  });

  describe("toInvitationRequestError", () => {
    it("deve tratar o 422 com INVALID_INVITATION_TOKEN como convite inválido", () => {
      const error = toInvitationRequestError(
        new ApiRequestError("O convite e invalido.", 422, "INVALID_INVITATION_TOKEN")
      );

      expect(error.type).toBe("invalid_invitation");
    });

    it("deve tratar o erro de validação do e-mail ou do código como link inválido", () => {
      const error = toInvitationRequestError(
        new ApiRequestError("Validation error.", 422, "VALIDATION_ERROR", {
          token: ["Informe o codigo do convite."],
        })
      );

      expect(error.type).toBe("invalid_invitation");
    });

    it("deve levar as mensagens do 422 aos campos do formulário", () => {
      const error = toInvitationRequestError(
        new ApiRequestError("Validation error.", 422, "VALIDATION_ERROR", {
          name: ["Informe nome e sobrenome."],
          password: ["A senha deve ter pelo menos 8 caracteres."],
          extra: ["Campo fora do formulário."],
        })
      );

      expect(error.type).toBe("validation");
      expect(error.fieldErrors).toEqual({
        nomeCompleto: "Informe nome e sobrenome.",
        senha: "A senha deve ter pelo menos 8 caracteres.",
      });
      expect(error.otherErrors).toEqual(["Campo fora do formulário."]);
    });

    it("deve tratar o 429 como muitas tentativas", () => {
      expect(
        toInvitationRequestError(new ApiRequestError("Muitas tentativas.", 429, "TOO_MANY_ATTEMPTS"))
          .type
      ).toBe("too_many_requests");
    });

    it("deve tratar as demais falhas como erro de servidor", () => {
      expect(toInvitationRequestError(new ApiRequestError("Erro interno.", 500)).type).toBe(
        "server_error"
      );
      expect(toInvitationRequestError(new Error("Network Error")).type).toBe("server_error");
    });
  });

  describe("validateInvitation", () => {
    it("envia e-mail e código ao POST /auth/invitations/validate, sem CSRF", async () => {
      const spy = mockRequest(() =>
        mockResponse({ success: true, data: { email: "ana@exemplo.com", is_valid: true } })
      );

      await expect(validateInvitation(credentials)).resolves.toEqual({
        email: "ana@exemplo.com",
        is_valid: true,
      });

      const [config] = spy.mock.calls[0];
      expect(config).toMatchObject({
        url: "/auth/invitations/validate",
        method: "post",
        data: { email: "ana@exemplo.com", token: "abc" },
      });
      expect(config.headers).not.toHaveProperty("X-CSRF-TOKEN");
    });

    it("lança invalid_invitation para o convite inválido ou expirado", async () => {
      mockRequest(() => {
        throw invalidTokenError();
      });

      const error = await validateInvitation(credentials).catch((err: unknown) => err);

      expect(error).toBeInstanceOf(InvitationRequestError);
      expect((error as InvitationRequestError).type).toBe("invalid_invitation");
    });

    it("lança too_many_requests no 429 e server_error no 500", async () => {
      mockRequest(() => {
        throw mockAxiosError(429, { success: false, message: "Muitas", code: "TOO_MANY_ATTEMPTS" });
      });
      await expect(validateInvitation(credentials)).rejects.toMatchObject({
        type: "too_many_requests",
      });

      vi.restoreAllMocks();
      mockRequest(() => {
        throw mockAxiosError(500, { success: false, message: "Falhou" });
      });
      await expect(validateInvitation(credentials)).rejects.toMatchObject({ type: "server_error" });
    });
  });

  describe("completeInvitation", () => {
    it("envia os dados e a senha ao POST /auth/invitations/complete", async () => {
      const data = {
        id: 42,
        email: "ana@exemplo.com",
        user_type_id: 2,
        profile_type_id: 2,
        active_status: 1,
        account_status: "active",
      };
      const spy = mockRequest(() => mockResponse({ success: true, data }));

      await expect(completeInvitation(credentials, formValues)).resolves.toEqual(data);

      expect(spy.mock.calls[0][0]).toMatchObject({
        url: "/auth/invitations/complete",
        method: "post",
        data: toCompleteInvitationPayload(credentials, formValues),
      });
    });

    it("lança invalid_invitation quando o convite expira no envio", async () => {
      mockRequest(() => {
        throw invalidTokenError();
      });

      const error = await completeInvitation(credentials, formValues).catch((err: unknown) => err);

      expect((error as InvitationRequestError).type).toBe("invalid_invitation");
    });

    it("leva as mensagens do 422 aos campos", async () => {
      mockRequest(() => {
        throw mockAxiosError(422, {
          success: false,
          message: "Validation error.",
          code: "VALIDATION_ERROR",
          errors: { registration_number: ["Informe o codigo do funcionario."] },
        });
      });

      const error = (await completeInvitation(credentials, formValues).catch(
        (err: unknown) => err
      )) as InvitationRequestError;

      expect(error.type).toBe("validation");
      expect(error.fieldErrors).toEqual({ codigoFuncionario: "Informe o codigo do funcionario." });
    });
  });
});
