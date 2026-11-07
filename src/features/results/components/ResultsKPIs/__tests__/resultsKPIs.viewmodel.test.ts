import { describe, it, expect, vi } from "vitest";
import { useResultsKPIsVM } from "../resultsKPIs.viewmodel";
import type { ResultsKPIsProps } from "../resultsKPIs.types";
import type { ResultsLabels } from "../../../results.types";

describe("useResultsKPIsVM", () => {
  const mockLabels: ResultsLabels = {
    title: "Resultados",
    subtitle: "Todas as jornadas",
    kpiTotalCompleted: "Jornadas concluídas",
    kpiAverageScore: "Média geral",
    kpiDomainScore: (score: number) => `${score}/100`,
    kpiEmptyScore: "—",
    sectionTitle: "Jornadas concluídas",
    sectionSubtitle: "Revise os resultados",
    searchPlaceholder: "Buscar...",
    searchEmptyTitle: "Vazio",
    searchEmpty: "Vazio desc",
    userEmptyTitle: "Sem jornadas",
    userEmpty: "Sem jornadas desc",
    availableJourneysCta: "Ver jornadas",
    completedAt: (d: string) => `Concluída em ${d}`,
    completedScoreTag: (s: number) => `Concluída · ${s}/100`,
    questionsCount: (c: number) => `${c} perguntas`,
    viewResult: "Ver resultado",
    filtersButton: "Filtros",
    filtersButtonWithCount: (c: number) => `Filtros (${c})`,
    filtersTitle: "Filtros de busca",
    filtersDomainTitle: "Domínio",
    filtersClear: "Limpar filtros",
    filterDomainPrivacy: "Privacidade",
    filterDomainSecurity: "Segurança da Informação",
    filterDomainJoint: "Conjunta",
    paginationPrevious: "Anterior",
    paginationNext: "Próxima",
    paginationPageOf: (c: number, t: number) => `Página ${c} de ${t}`,
    errorTitle: "Erro",
    errorMetricsMessage: "Erro ao carregar estatísticas",
    errorMessage: "Erro geral",
    retryButton: "Tentar novamente",
    loadingAriaLabel: "Carregando",
    scoreAriaLabel: (s: number) => `Nota: ${s}`,
  };

  it("deve montar dinamicamente os blocos de média por domínio e exibir '—' para domínio sem nota", () => {
    const props: ResultsKPIsProps = {
      metrics: {
        totalCompleted: 12,
        domainMetrics: [
          { domain: "privacy", label: "Privacidade", averageScore: 84 },
          { domain: "security", label: "Segurança da Informação", averageScore: 60 },
          { domain: "joint", label: "Conjunta", averageScore: null },
        ],
      },
      isLoading: false,
      isError: false,
      labels: mockLabels,
    };

    const vm = useResultsKPIsVM(props);

    expect(vm.items).toHaveLength(4);
    expect(vm.items[0]).toEqual({
      id: "total-completed",
      label: "Jornadas concluídas",
      value: 12,
    });
    expect(vm.items[1]).toEqual({
      id: "domain-privacy",
      label: "Privacidade",
      value: "84/100",
    });
    expect(vm.items[2]).toEqual({
      id: "domain-security",
      label: "Segurança da Informação",
      value: "60/100",
    });
    expect(vm.items[3]).toEqual({
      id: "domain-joint",
      label: "Conjunta",
      value: "—",
    });
  });

  it("deve aceitar novos domínios adicionais dinamicamente", () => {
    const props: ResultsKPIsProps = {
      metrics: {
        totalCompleted: 5,
        domainMetrics: [
          { domain: "ai_governance", label: "Governança de IA", averageScore: 92 },
        ],
      },
      isLoading: false,
      isError: false,
      labels: mockLabels,
    };

    const vm = useResultsKPIsVM(props);

    expect(vm.items).toHaveLength(2);
    expect(vm.items[1]).toEqual({
      id: "domain-ai_governance",
      label: "Governança de IA",
      value: "92/100",
    });
  });

  it("deve lidar com estado de erro ou metrics nulo", () => {
    const onRetryMock = vi.fn();
    const props: ResultsKPIsProps = {
      metrics: null,
      isLoading: false,
      isError: true,
      onRetry: onRetryMock,
      labels: mockLabels,
    };

    const vm = useResultsKPIsVM(props);

    expect(vm.isError).toBe(true);
    expect(vm.errorMessage).toBe("Erro ao carregar estatísticas");
    expect(vm.retryButtonText).toBe("Tentar novamente");
  });
});
