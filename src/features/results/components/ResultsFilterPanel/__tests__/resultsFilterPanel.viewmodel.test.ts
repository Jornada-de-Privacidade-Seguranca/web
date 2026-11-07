import { describe, it, expect, vi } from "vitest";
import { useResultsFilterPanelVM } from "../resultsFilterPanel.viewmodel";
import type { ResultsFilterPanelProps } from "../resultsFilterPanel.types";
import type { ResultsLabels } from "../../../results.types";

describe("useResultsFilterPanelVM", () => {
  const mockLabels: ResultsLabels = {
    title: "Resultados",
    subtitle: "Todas as jornadas",
    kpiTotalCompleted: "Jornadas concluídas",
    kpiAverageScore: "Média geral",
    kpiDomainScore: (s: number) => `${s}/100`,
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

  it("deve montar as opções de domínio e identificar as selecionadas", () => {
    const onToggleDomainMock = vi.fn();
    const onClearFiltersMock = vi.fn();

    const props: ResultsFilterPanelProps = {
      isOpen: true,
      filters: { domains: ["privacy"] },
      labels: mockLabels,
      onToggleDomain: onToggleDomainMock,
      onClearFilters: onClearFiltersMock,
    };

    const vm = useResultsFilterPanelVM(props);

    expect(vm.isOpen).toBe(true);
    expect(vm.hasActiveFilters).toBe(true);
    expect(vm.domainOptions).toHaveLength(3);

    expect(vm.domainOptions[0]).toEqual({
      id: "privacy",
      label: "Privacidade",
      isSelected: true,
    });
    expect(vm.domainOptions[1]).toEqual({
      id: "security",
      label: "Segurança da Informação",
      isSelected: false,
    });
    expect(vm.domainOptions[2]).toEqual({
      id: "joint",
      label: "Conjunta",
      isSelected: false,
    });

    vm.onToggleDomain("security");
    expect(onToggleDomainMock).toHaveBeenCalledWith("security");

    vm.onClearFilters();
    expect(onClearFiltersMock).toHaveBeenCalled();
  });

  it("deve sinalizar hasActiveFilters como falso quando nenhum domínio estiver selecionado", () => {
    const props: ResultsFilterPanelProps = {
      isOpen: false,
      filters: { domains: [] },
      labels: mockLabels,
      onToggleDomain: vi.fn(),
      onClearFilters: vi.fn(),
    };

    const vm = useResultsFilterPanelVM(props);

    expect(vm.isOpen).toBe(false);
    expect(vm.hasActiveFilters).toBe(false);
  });
});
