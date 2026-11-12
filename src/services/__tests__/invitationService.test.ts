import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  InvitationRequestError,
  MOCK_EXPIRED_TOKEN,
  MOCK_EXPIRES_ON_SUBMIT_TOKEN,
  completeInvitation,
  toCompleteInvitationPayload,
  toInvitationRequestError,
  validateInvitation,
} from "../invitationService";
import { ApiRequestError } from "../httpClient";
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

/** Resolve a chamada simulada sem esperar o atraso do mock. */
async function settle<T>(promise: Promise<T>): Promise<T> {
  const settled = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error })
  );
  await vi.runAllTimersAsync();
  const result = await settled;
  if ("error" in result) throw result.error;
  return result.value;
}

describe("invitationService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

    it("deve tratar as demais falhas como erro de servidor", () => {
      expect(toInvitationRequestError(new ApiRequestError("Erro interno.", 500)).type).toBe(
        "server_error"
      );
      expect(toInvitationRequestError(new Error("Network Error")).type).toBe("server_error");
    });
  });

  describe("validateInvitation", () => {
    it("deve validar o convite no formato da resposta do backend", async () => {
      await expect(settle(validateInvitation(credentials))).resolves.toEqual({
        email: "ana@exemplo.com",
        is_valid: true,
      });
    });

    it("deve lançar invalid_invitation para o convite expirado", async () => {
      const error = await settle(
        validateInvitation({ ...credentials, token: MOCK_EXPIRED_TOKEN })
      ).catch((err: unknown) => err);

      expect(error).toBeInstanceOf(InvitationRequestError);
      expect((error as InvitationRequestError).type).toBe("invalid_invitation");
    });
  });

  describe("completeInvitation", () => {
    it("deve ativar a conta no formato da resposta do backend", async () => {
      await expect(settle(completeInvitation(credentials, formValues))).resolves.toEqual({
        id: 42,
        email: "ana@exemplo.com",
        user_type_id: null,
        active_status: 1,
        account_status: "active",
      });
    });

    it("deve lançar invalid_invitation quando o convite expira no envio", async () => {
      const error = await settle(
        completeInvitation({ ...credentials, token: MOCK_EXPIRES_ON_SUBMIT_TOKEN }, formValues)
      ).catch((err: unknown) => err);

      expect((error as InvitationRequestError).type).toBe("invalid_invitation");
    });

    it("não deve aceitar o convite que já era inválido ao abrir", async () => {
      const error = await settle(
        completeInvitation({ ...credentials, token: MOCK_EXPIRED_TOKEN }, formValues)
      ).catch((err: unknown) => err);

      expect((error as InvitationRequestError).type).toBe("invalid_invitation");
    });
  });
});
