import { beforeEach, describe, expect, it } from "vitest";
import type { AuthenticatedUser } from "@features/auth/auth.types";
import {
  getUserProfile,
  updateUserProfile,
  resetProfileMock,
  createDefaultProfileMock,
} from "../profileService";

const mockAuthUser: AuthenticatedUser = {
  id: 1,
  name: "Joana Lima",
  email: "joana@tre.gov.br",
  role: "common_user",
  profile: {
    role: "common_user",
    label: "Colaboradora",
    user_type_id: 1,
    profile_type_id: 1,
    profile_type_name: "Colaboradora",
  },
  active_status: 1,
};

describe("profileService", () => {
  beforeEach(() => {
    resetProfileMock();
  });

  it("returns mock profile matching #152 format with organization, department, employeeCode", async () => {
    const profile = await getUserProfile(mockAuthUser);

    expect(profile).toBeDefined();
    expect(profile.user).toEqual(
      expect.objectContaining({
        name: "Joana Lima",
        email: "joana@tre.gov.br",
        organization: "Tribunal Regional Eleitoral",
        department: "Tecnologia da Informação",
        employeeCode: "TRE-2026-0842",
      }),
    );
    expect(profile.activity).toEqual({
      completedJourneys: 0,
      inProgressJourneys: 0,
      averageByDomain: {
        privacy: 0,
        security: 0,
        combined: 0,
      },
    });
  });

  it("creates default mock when optional user is not fully populated", () => {
    const defaultProfile = createDefaultProfileMock();
    expect(defaultProfile.user.name).toBe("Administrador do Sistema");
    expect(defaultProfile.user.email).toBe("admin@tre.gov.br");
    expect(defaultProfile.user.organization).toBe("Tribunal Regional Eleitoral");
    expect(defaultProfile.user.department).toBe("Tecnologia da Informação");
  });

  it("updates editable profile fields in memory and preserves employeeCode", async () => {
    const initialProfile = await getUserProfile(mockAuthUser);

    const updatedProfile = await updateUserProfile(mockAuthUser, initialProfile, {
      name: "Joana Souza",
      organization: "Novo Órgão",
      email: "joana.souza@tre.gov.br",
      department: "Segurança da Informação",
    });

    expect(updatedProfile.user).toEqual({
      name: "Joana Souza",
      organization: "Novo Órgão",
      email: "joana.souza@tre.gov.br",
      department: "Segurança da Informação",
      employeeCode: "TRE-2026-0842",
    });

    // Subsequente chamada de getUserProfile reflete a atualização
    const fetchedAgain = await getUserProfile(mockAuthUser);
    expect(fetchedAgain.user.name).toBe("Joana Souza");
    expect(fetchedAgain.user.organization).toBe("Novo Órgão");
  });

  it("throws error when authenticatedUser is missing", async () => {
    // @ts-expect-error test invalid param
    await expect(getUserProfile(undefined)).rejects.toThrow(
      "Usuário autenticado não informado.",
    );

    const initial = await getUserProfile(mockAuthUser);
    // @ts-expect-error test invalid param
    await expect(updateUserProfile(undefined, initial, {
      name: "Teste",
      organization: "Org",
      email: "teste@teste.com",
      department: "Dept",
    })).rejects.toThrow("Usuário autenticado não informado.");
  });
});
