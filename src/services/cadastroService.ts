import { ApiRequestError, apiRequest } from "@services/httpClient";
import type {
  CadastroFieldErrors,
  CadastroFieldErrorsSplit,
  CadastroFormData,
  CadastroPayload,
  CadastroRequestErrorType,
  CadastroResponse,
} from "@features/cadastro/cadastro.types";

/** Nome de cada campo da API no formulário de cadastro. */
const FORM_FIELD_BY_API_FIELD: Record<string, keyof CadastroFormData> = {
  name: "nomeCompleto",
  email: "email",
  password: "senha",
  password_confirmation: "confirmarSenha",
  organization: "empresa",
  department: "departamento",
  registration_number: "codigoFuncionario",
};

export class CadastroRequestError extends Error {
  readonly type: CadastroRequestErrorType;
  /** Mensagens dos campos do formulário, no 422 */
  readonly fieldErrors: CadastroFieldErrors;
  /** Mensagens de campos da API que não existem no formulário */
  readonly otherErrors: string[];

  constructor(
    type: CadastroRequestErrorType,
    message: string,
    fieldErrors: CadastroFieldErrors = {},
    otherErrors: string[] = []
  ) {
    super(message);
    this.name = "CadastroRequestError";
    this.type = type;
    this.fieldErrors = fieldErrors;
    this.otherErrors = otherErrors;
  }
}

/**
 * Separa as mensagens de um 422 entre os campos do formulário de cadastro (a
 * primeira de cada um) e as dos campos da API que não existem nele. A ativação
 * por convite usa os mesmos nomes de campo e reaproveita esta conversão.
 */
export function splitCadastroFieldErrors(errors: Record<string, string[]> | undefined): CadastroFieldErrorsSplit {
  const fieldErrors: CadastroFieldErrors = {};
  const otherErrors: string[] = [];
  for (const [apiField, messages] of Object.entries(errors ?? {})) {
    const formField = FORM_FIELD_BY_API_FIELD[apiField];
    if (formField) {
      fieldErrors[formField] = messages[0];
    } else {
      otherErrors.push(...messages);
    }
  }
  return { fieldErrors, otherErrors };
}

export function toCadastroPayload(values: CadastroFormData): CadastroPayload {
  return {
    name: values.nomeCompleto,
    email: values.email,
    password: values.senha,
    password_confirmation: values.confirmarSenha,
    organization: values.empresa,
    department: values.departamento,
    registration_number: values.codigoFuncionario,
  };
}

function toCadastroRequestError(err: unknown): CadastroRequestError {
  const message = err instanceof Error ? err.message : "Erro ao realizar cadastro do usuário.";

  if (!(err instanceof ApiRequestError)) {
    return new CadastroRequestError("server_error", message);
  }

  if (err.status === 409) {
    return new CadastroRequestError("already_registered", message);
  }

  if (err.status === 422) {
    const { fieldErrors, otherErrors } = splitCadastroFieldErrors(err.errors);
    return new CadastroRequestError("validation", message, fieldErrors, otherErrors);
  }

  return new CadastroRequestError("server_error", message);
}

/**
 * Cadastra a conta pelo POST /auth/register, convertendo os campos do
 * formulário para os da API. Falhas são lançadas como CadastroRequestError:
 * 422 com as mensagens por campo, 409 para e-mail já cadastrado e
 * "server_error" para as demais.
 */
export async function registerUser(values: CadastroFormData): Promise<CadastroResponse> {
  try {
    return await apiRequest<CadastroResponse>(
      "/auth/register",
      { method: "post", data: toCadastroPayload(values) },
      "Erro ao realizar cadastro do usuário."
    );
  } catch (err: unknown) {
    throw toCadastroRequestError(err);
  }
}
