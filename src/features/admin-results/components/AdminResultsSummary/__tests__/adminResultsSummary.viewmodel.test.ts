import { describe, it, expect } from "vitest";
import { useAdminResultsSummaryVM } from "../adminResultsSummary.viewmodel";

describe("useAdminResultsSummaryVM", () => {
  const labels = {
    summaryAriaLabel: "Resumo",
    summaryTotalCompleted: "Jornadas concluídas",
    summaryTotalUsers: "Usuários avaliados",
    summaryDomainScore: (score: number) => `${score}/100`,
    summaryEmptyScore: "—",
    loadingAriaLabel: "Carregando...",
  };

  it("deve montar cards de totais e médias por domínio, exibindo '—' quando nulo", () => {
    const vm = useAdminResultsSummaryVM({
      summary: {
        totalCompletedJourneys: 5,
        totalEvaluatedUsers: 3,
        domainAverages: [
          {
            domain: "privacy",
            namePt: "Privacidade",
            nameEn: "Privacy",
            label: "Privacidade",
            averageScore: 84,
            completedCount: 3,
          },
          {
            domain: "joint",
            namePt: "Conjunta",
            nameEn: "Joint",
            label: "Conjunta",
            averageScore: null,
            completedCount: 0,
          },
        ],
      },
      isLoading: false,
      labels,
    });

    expect(vm.items).toEqual([
      { id: "total-completed", label: "Jornadas concluídas", value: 5 },
      { id: "total-users", label: "Usuários avaliados", value: 3 },
      { id: "domain-privacy", label: "Privacidade", value: "84/100" },
      { id: "domain-joint", label: "Conjunta", value: "—" },
    ]);
  });

  it("deve retornar itens de skeleton durante o carregamento", () => {
    const vm = useAdminResultsSummaryVM({
      summary: { totalCompletedJourneys: 0, totalEvaluatedUsers: 0, domainAverages: [] },
      isLoading: true,
      labels,
    });

    expect(vm.isLoading).toBe(true);
    expect(vm.items).toHaveLength(5);
  });
});

