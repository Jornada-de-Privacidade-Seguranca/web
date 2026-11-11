import { describe, it, expect } from "vitest";
import { getAdminResults } from "../adminResultsService";

describe("adminResultsService", () => {
  it("deve retornar lista paginada, opções de filtro e resumo por domínio sem média geral", async () => {
    const response = await getAdminResults({ page: 1, perPage: 6 });

    expect(response.items).toHaveLength(6);
    expect(response.total).toBe(14);
    expect(response.filteredTotal).toBe(14);
    expect(response.page).toBe(1);
    expect(response.totalPages).toBe(3);

    expect(response.summary.totalCompletedJourneys).toBe(14);
    expect(response.summary.totalEvaluatedUsers).toBe(6);
    expect(response.summary.domainAverages).toHaveLength(3);
    expect("averageScore" in response.summary).toBe(false);

    const privacy = response.summary.domainAverages.find((d) => d.domain === "privacy");
    const security = response.summary.domainAverages.find((d) => d.domain === "security");
    const joint = response.summary.domainAverages.find((d) => d.domain === "joint");

    expect(privacy?.averageScore).toBe(82); // (90+95+88+72+66)/5 = 82.2 -> 82
    expect(security?.averageScore).toBe(79); // (91+78+58+79+82+85)/6 = 78.83 -> 79
    expect(joint?.averageScore).toBe(77); // (92+84+54)/3 = 76.67 -> 77

    expect(response.filterOptions.users.length).toBe(6);
    expect(response.filterOptions.departments.length).toBeGreaterThan(0);
    expect(response.filterOptions.domains.map((d) => d.id)).toEqual([
      "privacy",
      "security",
      "joint",
    ]);
  });

  it("deve filtrar por busca textual (nome, e-mail e perfil em PT ou EN)", async () => {
    const byName = await getAdminResults({ search: "carlos" });
    expect(byName.filteredTotal).toBe(2);
    expect(byName.items.every((item) => item.user.id === "2")).toBe(true);

    const byEmail = await getAdminResults({ search: "mariana.oliveira@empresa.com" });
    expect(byEmail.filteredTotal).toBe(2);

    const byProfileEn = await getAdminResults({ search: "Data Controller" });
    expect(byProfileEn.filteredTotal).toBe(1);
    expect(byProfileEn.items[0].profileNamePt).toBe("Controlador");
  });

  it("deve filtrar por usuário, setor, perfil de jornada e atualizar o resumo com '—' para domínios sem jornadas", async () => {
    // Usuário 2 (Carlos) possui apenas 2 jornadas de Privacidade (95 e 88)
    const byUser = await getAdminResults({ userId: "2" });

    expect(byUser.filteredTotal).toBe(2);
    expect(byUser.summary.totalCompletedJourneys).toBe(2);
    expect(byUser.summary.totalEvaluatedUsers).toBe(1);

    const privacy = byUser.summary.domainAverages.find((d) => d.domain === "privacy");
    const security = byUser.summary.domainAverages.find((d) => d.domain === "security");
    const joint = byUser.summary.domainAverages.find((d) => d.domain === "joint");

    expect(privacy?.averageScore).toBe(92); // (95+88)/2 = 91.5 -> 92
    expect(security?.averageScore).toBeNull();
    expect(joint?.averageScore).toBeNull();

    const byDepartment = await getAdminResults({ department: "Tecnologia da Informação" });
    expect(byDepartment.filteredTotal).toBe(7);
    expect(byDepartment.summary.totalEvaluatedUsers).toBe(2);

    const byProfile = await getAdminResults({ journeyProfileId: "6" });
    expect(byProfile.filteredTotal).toBe(3);
  });

  it("deve suportar filtro com múltiplos domínios e período de conclusão", async () => {
    const byDomains = await getAdminResults({ domains: ["privacy", "joint"], perPage: 20 });
    expect(byDomains.filteredTotal).toBe(8);
    expect(byDomains.items.every((item) => item.domain === "privacy" || item.domain === "joint")).toBe(
      true
    );

    const byPeriod = await getAdminResults({
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31",
      perPage: 20,
    });
    expect(byPeriod.filteredTotal).toBe(7);
    expect(
      byPeriod.items.every(
        (item) =>
          item.completedAt.slice(0, 10) >= "2026-05-01" &&
          item.completedAt.slice(0, 10) <= "2026-05-31"
      )
    ).toBe(true);
  });

  it("deve paginar corretamente e retornar estado vazio quando nenhum resultado corresponder", async () => {
    const page2 = await getAdminResults({ page: 2, perPage: 6 });
    expect(page2.page).toBe(2);
    expect(page2.items).toHaveLength(6);

    const page3 = await getAdminResults({ page: 3, perPage: 6 });
    expect(page3.page).toBe(3);
    expect(page3.items).toHaveLength(2);

    const empty = await getAdminResults({ search: "inexistente-xyz" });
    expect(empty.items).toHaveLength(0);
    expect(empty.filteredTotal).toBe(0);
    expect(empty.total).toBe(14);
    expect(empty.totalPages).toBe(1);
    expect(empty.summary.totalCompletedJourneys).toBe(0);
    expect(empty.summary.totalEvaluatedUsers).toBe(0);
    expect(empty.summary.domainAverages.every((d) => d.averageScore === null)).toBe(true);
  });
});

