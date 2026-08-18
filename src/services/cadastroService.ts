import { apiRequest } from "@services/httpClient";
import type {
  CadastroPayload,
  CadastroResponse,
} from "@features/cadastro/cadastro.types";

export async function registerUser(
  payload: CadastroPayload
): Promise<CadastroResponse> {
  return apiRequest<CadastroResponse>(
    "/auth/register",
    { method: "post", data: payload },
    "Erro ao realizar cadastro do usuário."
  );
}
