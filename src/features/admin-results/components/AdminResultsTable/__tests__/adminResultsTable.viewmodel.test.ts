import { describe, it, expect } from "vitest";
import { useAdminResultsTableVM } from "../adminResultsTable.viewmodel";

describe("useAdminResultsTableVM", () => {
  it("deve mapear linhas com rota do resultado, classes de faixa de nota e fallback de setor", () => {
    const vm = useAdminResultsTableVM({
      results: [
        {
          id: "ar-1",
          journeyId: "101",
          user: {
            id: "1",
            name: "Ana Beatriz Silva",
            email: "ana@empresa.com",
            initials: "AS",
            department: "",
          },
          profileId: "1",
          profileTitle: "Encarregado",
          profileNamePt: "Encarregado",
          profileNameEn: "DPO",
          domain: "privacy",
          domainNamePt: "Privacidade",
          domainNameEn: "Privacy",
          domainLabel: "Privacidade",
          completedAt: "2026-06-08T14:20:00Z",
          score: 70,
          scoreBand: "medium",
        },
      ],
      labels: {
        tableUser: "Usuário",
        tableDepartment: "Setor",
        tableProfile: "Perfil",
        tableDomain: "Domínio",
        tableCompletedAt: "Data",
        tableScore: "Nota",
        tableActions: "Ações",
        tableView: "Ver",
        tableEmptyDepartment: "—",
        scoreValue: (s) => `${s}/100`,
        scoreAriaLabel: (s, b) => `${s} (${b})`,
        formatDate: () => "08/06/2026",
      },
    });

    expect(vm.rows[0]).toMatchObject({
      department: "—",
      formattedDate: "08/06/2026",
      scoreText: "70/100",
      resultHref: "/jornada/101/resultado",
      viewAriaLabel: "Ver — Ana Beatriz Silva — Encarregado",
    });
    expect(vm.rows[0].scoreBadgeClasses).toContain("amber");
  });
});

