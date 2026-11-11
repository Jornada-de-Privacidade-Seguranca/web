import { apiRequest } from "@services/httpClient";
import { mapKnowledgeDomainId } from "@services/journeyService";
import type {
  OwnProfileApi,
  OwnProfileUpdateApi,
  ProfileActivity,
  ProfileMetricsApi,
  ProfileUpdatePayload,
  UserProfile,
} from "@features/profile/profile.types";

export function mapOwnProfile(data: OwnProfileApi): UserProfile {
  return {
    name: data.name ?? "",
    organization: data.organization ?? "",
    email: data.email ?? "",
    employeeCode: data.registration_number ?? "",
    department: data.department ?? "",
  };
}

export function mapProfileActivity(data: ProfileMetricsApi): ProfileActivity {
  const averageByDomain: ProfileActivity["averageByDomain"] = {
    privacy: null,
    security: null,
    combined: null,
  };

  for (const metric of data.domains ?? []) {
    const domain = mapKnowledgeDomainId(metric.domain_id);
    const average = metric.average_score ?? null;
    if (domain === "privacy") averageByDomain.privacy = average;
    if (domain === "security") averageByDomain.security = average;
    if (domain === "joint") averageByDomain.combined = average;
  }

  return {
    completedJourneys: data.summary?.completed_journeys ?? 0,
    inProgressJourneys: data.summary?.ongoing_journeys ?? 0,
    averageByDomain,
  };
}

/** Dados do próprio usuário, de GET /me. */
export async function getOwnProfile(): Promise<UserProfile> {
  const data = await apiRequest<OwnProfileApi>(
    "/me",
    {},
    "Não foi possível carregar o perfil."
  );
  return mapOwnProfile(data);
}

/** Resumo de atividade do usuário, de GET /users/{user}/journeys/metrics. */
export async function getProfileActivity(userId: number): Promise<ProfileActivity> {
  const data = await apiRequest<ProfileMetricsApi>(
    `/users/${userId}/journeys/metrics`,
    {},
    "Não foi possível carregar a atividade no sistema."
  );
  return mapProfileActivity(data);
}

/**
 * Salva os campos alterados em PATCH /me e devolve o perfil atualizado. Erros
 * chegam como ApiRequestError: 422 com `errors` por campo e 409
 * (EMAIL_ALREADY_IN_USE) quando o e-mail já pertence a outra conta.
 */
export async function updateOwnProfile(payload: ProfileUpdatePayload): Promise<UserProfile> {
  const body: OwnProfileUpdateApi = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.organization !== undefined) body.organization = payload.organization;
  if (payload.department !== undefined) body.department = payload.department;

  const data = await apiRequest<OwnProfileApi>(
    "/me",
    { method: "patch", data: body, withCsrf: true },
    "Não foi possível salvar o perfil."
  );
  return mapOwnProfile(data);
}
