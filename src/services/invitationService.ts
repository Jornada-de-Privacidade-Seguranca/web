import { ApiRequestError } from "@services/httpClient";
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

// --- Mocks no formato do PR 78 do backend (#122) ---------------------------
// Enquanto a integração (#176) não entra, as duas chamadas são simuladas. Com o
// código `expirado`, o convite é inválido desde a validação; com
// `expira-no-envio`, ele é válido ao abrir e expira no envio do formulário.

const MOCK_DELAY_MS = 600;
export const MOCK_EXPIRED_TOKEN = "expirado";
export const MOCK_EXPIRES_ON_SUBMIT_TOKEN = "expira-no-envio";

function mockInvalidInvitation(): ApiRequestError {
  return new ApiRequestError(
    "O convite e invalido, expirou ou ja foi utilizado.",
    422,
    INVALID_INVITATION_TOKEN_CODE
  );
}

async function mockRequest<T>(respond: () => T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return respond();
}

/**
 * Valida o convite do link (POST /auth/invitations/validate). Falhas são
 * lançadas como InvitationRequestError: `invalid_invitation` para convite
 * inválido, expirado ou já usado, e `server_error` para as demais.
 */
export async function validateInvitation(
  credentials: InvitationCredentials
): Promise<ValidateInvitationResponse> {
  try {
    return await mockRequest(() => {
      if (credentials.token === MOCK_EXPIRED_TOKEN) {
        throw mockInvalidInvitation();
      }
      return { email: credentials.email, is_valid: true };
    });
  } catch (err: unknown) {
    throw toInvitationRequestError(err);
  }
}

/**
 * Ativa a conta convidada com os dados pessoais e a senha (POST
 * /auth/invitations/complete). Falhas são lançadas como InvitationRequestError:
 * `invalid_invitation` se o convite expirou no meio do preenchimento,
 * `validation` com as mensagens por campo e `server_error` para as demais.
 */
export async function completeInvitation(
  credentials: InvitationCredentials,
  values: InitialPasswordFormValues
): Promise<InvitedUserResponse> {
  const payload = toCompleteInvitationPayload(credentials, values);
  try {
    return await mockRequest(() => {
      if ([MOCK_EXPIRED_TOKEN, MOCK_EXPIRES_ON_SUBMIT_TOKEN].includes(payload.token)) {
        throw mockInvalidInvitation();
      }
      return {
        id: 42,
        email: payload.email,
        user_type_id: null,
        active_status: 1,
        account_status: "active",
      };
    });
  } catch (err: unknown) {
    throw toInvitationRequestError(err);
  }
}
