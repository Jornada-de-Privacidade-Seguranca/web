import { ApiRequestError, apiRequest } from "@services/httpClient";
import { splitCadastroFieldErrors } from "@services/cadastroService";
import type {
  CompleteInvitationPayload,
  InitialPasswordFieldErrors,
  InitialPasswordFormValues,
  InvitationCredentials,
  InvitationRequestErrorType,
  InvitedUserResponse,
  ValidateInvitationResponse,
} from "@features/initial-password/initialPassword.types";

/** `code` do 422 do backend para convite inválido, expirado ou já usado. */
export const INVALID_INVITATION_TOKEN_CODE = "INVALID_INVITATION_TOKEN";

/** Campos do link: um erro neles indica link malformado, e não um campo do formulário. */
const LINK_FIELDS = ["email", "token"];

export class InvitationRequestError extends Error {
  readonly type: InvitationRequestErrorType;
  /** Mensagens dos campos do formulário, no 422 */
  readonly fieldErrors: InitialPasswordFieldErrors;
  /** Mensagens de campos da API que não existem no formulário */
  readonly otherErrors: string[];

  constructor(
    type: InvitationRequestErrorType,
    message: string,
    fieldErrors: InitialPasswordFieldErrors = {},
    otherErrors: string[] = []
  ) {
    super(message);
    this.name = "InvitationRequestError";
    this.type = type;
    this.fieldErrors = fieldErrors;
    this.otherErrors = otherErrors;
  }
}

export function toCompleteInvitationPayload(
  credentials: InvitationCredentials,
  values: InitialPasswordFormValues
): CompleteInvitationPayload {
  return {
    email: credentials.email,
    token: credentials.token,
    name: values.nomeCompleto,
    organization: values.empresa,
    department: values.departamento,
    registration_number: values.codigoFuncionario,
    password: values.senha,
    password_confirmation: values.confirmarSenha,
  };
}

export function toInvitationRequestError(err: unknown): InvitationRequestError {
  const message = err instanceof Error ? err.message : "Não foi possível concluir o convite.";

  if (err instanceof ApiRequestError && err.status === 429) {
    return new InvitationRequestError("too_many_requests", message);
  }

  if (!(err instanceof ApiRequestError) || err.status !== 422) {
    return new InvitationRequestError("server_error", message);
  }

  const errors = err.errors ?? {};
  if (
    err.code === INVALID_INVITATION_TOKEN_CODE ||
    LINK_FIELDS.some((field) => field in errors)
  ) {
    return new InvitationRequestError("invalid_invitation", message);
  }

  const { fieldErrors, otherErrors } = splitCadastroFieldErrors(errors);
  return new InvitationRequestError("validation", message, fieldErrors, otherErrors);
}

/**
 * Valida o convite do link (POST /auth/invitations/validate). Falhas são
 * lançadas como InvitationRequestError: `invalid_invitation` para convite
 * inválido, expirado ou já usado, `too_many_requests` no 429 e `server_error`
 * para as demais.
 */
export async function validateInvitation(
  credentials: InvitationCredentials
): Promise<ValidateInvitationResponse> {
  try {
    return await apiRequest<ValidateInvitationResponse>(
      "/auth/invitations/validate",
      { method: "post", data: { email: credentials.email, token: credentials.token } },
      "Não foi possível validar o convite."
    );
  } catch (err: unknown) {
    throw toInvitationRequestError(err);
  }
}

/**
 * Ativa a conta convidada com os dados pessoais e a senha (POST
 * /auth/invitations/complete). Falhas são lançadas como InvitationRequestError:
 * `invalid_invitation` se o convite expirou no meio do preenchimento,
 * `validation` com as mensagens por campo, `too_many_requests` no 429 e
 * `server_error` para as demais.
 */
export async function completeInvitation(
  credentials: InvitationCredentials,
  values: InitialPasswordFormValues
): Promise<InvitedUserResponse> {
  const payload = toCompleteInvitationPayload(credentials, values);
  try {
    return await apiRequest<InvitedUserResponse>(
      "/auth/invitations/complete",
      { method: "post", data: payload },
      "Não foi possível ativar a conta."
    );
  } catch (err: unknown) {
    throw toInvitationRequestError(err);
  }
}
