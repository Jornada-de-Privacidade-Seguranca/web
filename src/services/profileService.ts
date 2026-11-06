import type { AuthenticatedUser } from "@features/auth/auth.types";
import type {
  ProfileActivity,
  ProfileData,
  ProfileUpdatePayload,
} from "@features/profile/profile.types";

const EMPTY_ACTIVITY: ProfileActivity = {
  completedJourneys: 0,
  inProgressJourneys: 0,
  averageByDomain: {
    privacy: 0,
    security: 0,
    combined: 0,
  },
};

/**
 * Mock em memória do perfil do usuário para desenvolvimento e testes
 * enquanto a integração com os endpoints /me da API (#154) não for finalizada.
 * O formato segue o modelo da #152 (organization, department, registration_number).
 */
let inMemoryProfile: { userId?: number; profile: ProfileData } | null = null;

export function resetProfileMock(): void {
  inMemoryProfile = null;
}

export function createDefaultProfileMock(user?: AuthenticatedUser): ProfileData {
  return {
    user: {
      name: user?.name || "Administrador do Sistema",
      organization: "Tribunal Regional Eleitoral",
      email: user?.email || "admin@tre.gov.br",
      employeeCode: "TRE-2026-0842",
      department: "Tecnologia da Informação",
    },
    activity: EMPTY_ACTIVITY,
  };
}

export async function getUserProfile(
  authenticatedUser: AuthenticatedUser,
): Promise<ProfileData> {
  if (!authenticatedUser) {
    throw new Error("Usuário autenticado não informado.");
  }

  // Devolve o mock diretamente sem chamar a API até a implementação da tarefa #154.
  if (!inMemoryProfile || inMemoryProfile.userId !== authenticatedUser.id) {
    inMemoryProfile = {
      userId: authenticatedUser.id,
      profile: createDefaultProfileMock(authenticatedUser),
    };
  }

  return { ...inMemoryProfile.profile };
}

export async function updateUserProfile(
  authenticatedUser: AuthenticatedUser,
  currentProfile: ProfileData,
  payload: ProfileUpdatePayload,
): Promise<ProfileData> {
  if (!authenticatedUser) {
    throw new Error("Usuário autenticado não informado.");
  }

  const updated: ProfileData = {
    ...currentProfile,
    user: {
      ...currentProfile.user,
      name: payload.name,
      organization: payload.organization,
      email: payload.email,
      department: payload.department,
    },
  };

  inMemoryProfile = {
    userId: authenticatedUser.id,
    profile: updated,
  };
  return { ...updated };
}
