import axios, { type AxiosRequestConfig } from "axios";
import { env } from "@shared/config/env";

const CSRF_HEADER = "X-CSRF-TOKEN";
const CSRF_TOKEN_PATH = "/auth/csrf-token";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Erro de requisição que preserva o status HTTP e o `code` do envelope de erro
 * do backend, para que os services diferenciem 404, 422 e 5xx. A mensagem é a
 * mesma que antes era lançada como `Error` simples.
 */
export class ApiRequestError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

export interface ApiResponseWithMeta<T, M> {
  data: T;
  meta: M | undefined;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  /**
   * Requisições mutáveis de sessão (login, logout, etc.) precisam do token
   * CSRF obtido em /auth/csrf-token. GET/HEAD nunca enviam o header, mesmo
   * com a flag ligada.
   */
  withCsrf?: boolean;
}

/** Instância axios autenticada por sessão (cookie httpOnly). */
export const axiosInstance = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

let cachedCsrfToken: string | null = null;

/** Rotas de autenticação: o 401 delas (por exemplo, senha incorreta) não indica sessão expirada. */
const AUTH_PATH_PREFIX = "/auth/";

let unauthorizedHandler: (() => void) | null = null;

/**
 * Registra quem trata um 401 fora das rotas de autenticação (sessão expirada).
 * O httpClient só avisa; limpar o estado e redirecionar fica com quem registrou.
 */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

// No interceptador, e não em sendRequest, para valer também para os services
// que usam o axiosInstance diretamente
axiosInstance.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    !(error.config?.url ?? "").startsWith(AUTH_PATH_PREFIX)
  ) {
    unauthorizedHandler?.();
  }
  return Promise.reject(error);
});

function isMutatingMethod(method: AxiosRequestConfig["method"]): boolean {
  const normalized = (method ?? "get").toString().toUpperCase();
  return normalized !== "GET" && normalized !== "HEAD";
}

function toApiRequestError(error: unknown, defaultErrorMessage: string): ApiRequestError {
  const message = extractErrorMessage(error, defaultErrorMessage);
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { code?: unknown } | undefined;
    const code = typeof data?.code === "string" ? data.code : undefined;
    return new ApiRequestError(message, error.response?.status, code);
  }
  return new ApiRequestError(message);
}

function extractErrorMessage(error: unknown, defaultErrorMessage: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data && typeof data.message === "string") {
      return data.message;
    }
  }
  return defaultErrorMessage;
}

function unwrap<T>(payload: unknown, defaultErrorMessage: string): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const apiResponse = payload as ApiResponse<T>;
    if (apiResponse.success === false) {
      throw new Error(apiResponse.message || defaultErrorMessage);
    }
    return apiResponse.data;
  }
  return payload as T;
}

async function requestCsrfToken(): Promise<string> {
  try {
    const response = await axiosInstance.request<
      ApiResponse<{ csrf_token: string }>
    >({ method: "get", url: CSRF_TOKEN_PATH });
    cachedCsrfToken = unwrap<{ csrf_token: string }>(
      response.data,
      "Não foi possível iniciar a sessão de autenticação."
    ).csrf_token;
    return cachedCsrfToken;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, "Não foi possível iniciar a sessão de autenticação.")
    );
  }
}

async function getCsrfToken(): Promise<string> {
  return cachedCsrfToken ?? requestCsrfToken();
}

export function clearCsrfToken(): void {
  cachedCsrfToken = null;
}

/**
 * Envia a requisição com a sessão (cookie httpOnly). Requisições mutáveis
 * com `withCsrf: true` recebem o header X-CSRF-TOKEN; se o backend rejeitar
 * por token ausente/expirado (403/419), busca um token novo e refaz a
 * requisição original uma única vez. Retorna o corpo bruto da resposta.
 */
async function sendRequest(
  path: string,
  { withCsrf = false, headers, ...config }: ApiRequestConfig,
  defaultErrorMessage: string
): Promise<unknown> {
  const mutating = withCsrf && isMutatingMethod(config.method);
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (mutating) {
    requestHeaders[CSRF_HEADER] = await getCsrfToken();
  }

  const send = () =>
    axiosInstance.request<unknown>({
      ...config,
      url: path,
      headers: requestHeaders,
    });

  let response;
  try {
    response = await send();
  } catch (error) {
    if (
      mutating &&
      axios.isAxiosError(error) &&
      (error.response?.status === 403 || error.response?.status === 419)
    ) {
      clearCsrfToken();
      requestHeaders[CSRF_HEADER] = await requestCsrfToken();
      try {
        response = await send();
      } catch (retryError) {
        throw toApiRequestError(retryError, defaultErrorMessage);
      }
    } else {
      throw toApiRequestError(error, defaultErrorMessage);
    }
  }

  return response.data;
}

/** Cliente HTTP autenticado por sessão; devolve apenas o `data` do envelope. */
export async function apiRequest<T>(
  path: string,
  config: ApiRequestConfig = {},
  defaultErrorMessage = "Erro ao comunicar com o servidor."
): Promise<T> {
  const payload = await sendRequest(path, config, defaultErrorMessage);
  return unwrap<T>(payload, defaultErrorMessage);
}

/**
 * Igual a `apiRequest`, mas preserva o `meta` do envelope — necessário para
 * listagens paginadas (`meta.pagination`).
 */
export async function apiRequestWithMeta<T, M = Record<string, unknown>>(
  path: string,
  config: ApiRequestConfig = {},
  defaultErrorMessage = "Erro ao comunicar com o servidor."
): Promise<ApiResponseWithMeta<T, M>> {
  const payload = await sendRequest(path, config, defaultErrorMessage);
  const data = unwrap<T>(payload, defaultErrorMessage);
  const meta =
    payload && typeof payload === "object" && "meta" in payload
      ? (payload as { meta?: M }).meta
      : undefined;
  return { data, meta };
}
