import { env } from "@shared/config/env";
import type {
  CadastroPayload,
  CadastroResponse,
} from "@features/cadastro/cadastro.types";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

async function handleApiResponse<T>(
  response: Response,
  defaultErrorMessage: string
): Promise<T> {
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    if (
      json &&
      typeof json === "object" &&
      "message" in json &&
      typeof (json as ApiResponse<unknown>).message === "string"
    ) {
      throw new Error((json as ApiResponse<unknown>).message);
    }
    throw new Error(defaultErrorMessage);
  }

  if (json && typeof json === "object" && "data" in json) {
    const apiResponse = json as ApiResponse<T>;
    if (apiResponse.success === false) {
      throw new Error(apiResponse.message || defaultErrorMessage);
    }
    return apiResponse.data;
  }

  return json as T;
}

export async function registerUser(
  payload: CadastroPayload
): Promise<CadastroResponse> {
  const response = await fetch(`${env.API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleApiResponse<CadastroResponse>(
    response,
    "Erro ao realizar cadastro do usuário."
  );
}
