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

function isMutatingMethod(method: AxiosRequestConfig["method"]): boolean {
  const normalized = (method ?? "get").toString().toUpperCase();
  return normalized !== "GET" && normalized !== "HEAD";
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
 * Cliente HTTP autenticado por sessão (cookie httpOnly). Requisições
 * mutáveis com `withCsrf: true` recebem o header X-CSRF-TOKEN; se o backend
 * rejeitar por token ausente/expirado (403/419), busca um token novo e
 * refaz a requisição original uma única vez.
 */
export async function apiRequest<T>(
  path: string,
  { withCsrf = false, headers, ...config }: ApiRequestConfig = {},
  defaultErrorMessage = "Erro ao comunicar com o servidor."
): Promise<T> {
  const mutating = withCsrf && isMutatingMethod(config.method);
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (mutating) {
    requestHeaders[CSRF_HEADER] = await getCsrfToken();
  }

  const send = () =>
    axiosInstance.request<ApiResponse<T> | T>({
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
        throw new Error(extractErrorMessage(retryError, defaultErrorMessage));
      }
    } else {
      throw new Error(extractErrorMessage(error, defaultErrorMessage));
    }
  }

  return unwrap<T>(response.data, defaultErrorMessage);
}
