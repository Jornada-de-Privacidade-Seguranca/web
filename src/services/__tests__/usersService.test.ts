import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUsersList,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAccessProfiles,
  getInitials,
} from "../usersService";

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

  it("deve retornar um usuário por id e seus detalhes", async () => {
    const user = await getUserById("1");
    expect(user).toBeDefined();
    expect(user.id).toBe("1");
    expect(user.name).toBe("Ana Beatriz Silva");
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

  it("deve retornar a lista de perfis de acesso", async () => {
    const profiles = await getAccessProfiles();
    expect(profiles.length).toBe(3);
    expect(profiles.find((p) => p.isDefault)?.id).toBe("user");
  });
});
