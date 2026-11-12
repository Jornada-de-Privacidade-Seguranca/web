import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUsersList,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAccessProfiles,
  getAssignableJourneyProfiles,
  assignJourneyToUser,
  cancelAssignedJourney,
  getInitials,
  inviteUser,
} from "../usersService";
import { ApiRequestError } from "../httpClient";

describe("usersService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve calcular corretamente as iniciais do nome", () => {
    expect(getInitials("Carlos Santos")).toBe("CS");
    expect(getInitials("Ana")).toBe("AN");
    expect(getInitials("Maria Eduarda Silva")).toBe("MS");
    expect(getInitials("")).toBe("");
  });

  it("deve carregar a listagem paginada e aplicar filtros na busca", async () => {
    const result = await getUsersList({ search: "Ana", page: 1, limit: 6 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].name).toContain("Ana");
  });

  it("deve filtrar por setor, perfil e situação", async () => {
    const result = await getUsersList({ department: "Jurídico" });
    expect(result.items.every((u) => u.department === "Jurídico")).toBe(true);
  });

  it("deve retornar um usuário por id e seus detalhes com jornadas reais", async () => {
    const user = await getUserById("1");
    expect(user).toBeDefined();
    expect(user.id).toBe("1");
    expect(user.name).toBe("Ana Beatriz Silva");
    expect(user.journeys[0].title).toBe("Encarregado pelo Tratamento de Dados Pessoais");
  });

  it("deve atualizar os dados de um usuário", async () => {
    const updated = await updateUser("1", {
      name: "Ana Beatriz Atualizada",
      organization: "Gov",
      employeeCode: "EMP-9999",
      email: "ana.atualizada@empresa.com",
      department: "TI",
      role: "admin",
    });

    expect(updated.name).toBe("Ana Beatriz Atualizada");
    expect(updated.initials).toBe("AA");
    expect(updated.employeeCode).toBe("EMP-9999");
  });

  it("deve alternar a situação de um usuário", async () => {
    const user = await toggleUserStatus("1", "inactive");
    expect(user.status).toBe("inactive");
  });

  it("deve excluir um usuário", async () => {
    const res = await deleteUser("8");
    expect(res.success).toBe(true);
  });

  it("deve retornar a lista de perfis de acesso com as permissões da #132", async () => {
    const profiles = await getAccessProfiles();
    expect(profiles.length).toBe(3);

    const admin = profiles.find((p) => p.id === "admin");
    expect(admin?.permissions).toContain("users.manage");
    expect(admin?.permissions).toContain("catalog.manage");
    expect(admin?.permissions).toContain("results.view_all");

    const manager = profiles.find((p) => p.id === "manager");
    expect(manager?.description).toBe(
      "Vê tudo o que o administrador vê e pode atribuir jornadas, mas não altera usuários nem perfis."
    );

    const user = profiles.find((p) => p.id === "user");
    expect(user?.isDefault).toBe(true);
    expect(user?.permissions).toEqual(["journeys.take", "results.view_own"]);
  });

  it("deve criar convite pendente (201) para e-mail novo e retornar 409 ACCOUNT_ALREADY_EXISTS se já existir", async () => {
    const invited = await inviteUser({
      email: "  Novo.Convidado@Empresa.com ",
      role: "manager",
    });

    expect(invited.email).toBe("novo.convidado@empresa.com");
    expect(invited.role).toBe("manager");
    expect(invited.roleLabel).toBe("Gestor");
    expect(invited.status).toBe("pending");
    expect(new Date(invited.expiresAt).getTime()).toBeGreaterThan(Date.now());

    // Usuário convidado possui dados pessoais em branco no mock
    const createdInList = await getUsersList({ search: "novo.convidado@empresa.com" });
    expect(createdInList.items[0].name).toBe("");
    expect(createdInList.items[0].department).toBe("");
    expect(createdInList.items[0].employeeCode).toBe("");

    await expect(
      inviteUser({ email: "FERNANDA.COSTA@empresa.com", role: "user" })
    ).rejects.toMatchObject({
      status: 409,
      code: "ACCOUNT_ALREADY_EXISTS",
    });

    try {
      await inviteUser({ email: "fernanda.costa@empresa.com", role: "user" });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiRequestError);
    }
  });

  it("deve cobrir os 4 cenários de jornada em andamento no mock (#168) e permitir atribuir e cancelar", async () => {
    const selfStartedUser = await getUserById("1");
    expect(selfStartedUser.activeJourney?.origin).toBe("self_started");
    expect(selfStartedUser.activeJourney?.assigned_by).toBeNull();

    const assignedByMeUser = await getUserById("2");
    expect(assignedByMeUser.activeJourney?.origin).toBe("assigned");
    expect(assignedByMeUser.activeJourney?.assigned_by?.id).toBe(1);

    const assignedByOtherUser = await getUserById("3");
    expect(assignedByOtherUser.activeJourney?.origin).toBe("assigned");
    expect(assignedByOtherUser.activeJourney?.assigned_by?.id).toBe(99);

    const noActiveUser = await getUserById("4");
    expect(noActiveUser.activeJourney).toBeNull();

    const catalog = await getAssignableJourneyProfiles();
    expect(catalog.length).toBeGreaterThan(1);

    const afterAssign = await assignJourneyToUser("4", {
      profileId: catalog[0].id,
      assignedBy: { id: 1, name: "Usuário Teste" },
    });
    expect(afterAssign.activeJourney?.origin).toBe("assigned");
    expect(afterAssign.activeJourney?.assigned_by).toEqual({
      id: 1,
      name: "Usuário Teste",
    });

    const afterCancel = await cancelAssignedJourney("4");
    expect(afterCancel.activeJourney).toBeNull();
  });
});
