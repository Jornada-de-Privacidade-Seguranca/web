import { describe, it, expect } from "vitest";
import { useResultCardVM } from "../resultCard.viewmodel";
import type { ResultCardProps } from "../resultCard.types";
import type { ResultsLabels } from "../../../results.types";

describe("useResultCardVM", () => {
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
    scoreAriaLabel: (s: number) => `Nota: ${s} de 100`,
  };

  it("deve retornar os dados formatados do card com tag 'Concluída · x/100' e badge de domínio", () => {
    const props: ResultCardProps = {
      result: {
        id: "j-123",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        score: 78,
        completedAt: "2026-05-15T10:00:00Z",
        domain: "privacy",
      },
      labels: mockLabels,
    };

    const vm = useResultCardVM(props);

    expect(vm.title).toBe("Encarregado pelo Tratamento de Dados Pessoais");
    expect(vm.domainLabel).toBe("Privacidade");
    expect(vm.completedTagText).toBe("Concluída · 78/100");
    expect(vm.completedAtText).toBe("Concluída em 2026-05-15T10:00:00Z");
    expect(vm.actionHref).toBe("/jornada/j-123/resultado");
    expect(vm.buttonText).toBe("Ver resultado");
    expect(vm.ctaAriaLabel).toBe(
      "Ver resultado — Encarregado pelo Tratamento de Dados Pessoais"
    );
    expect(vm.badgeAriaLabel).toBe("Nota: 78 de 100");
  });

  it("deve priorizar domainLabel customizado quando fornecido", () => {
    const props: ResultCardProps = {
      result: {
        id: "j-999",
        title: "Gestor de Segurança da Informação",
        score: 95,
        completedAt: "2026-05-20T10:00:00Z",
        domain: "security",
        domainLabel: "Cybersecurity",
      },
      labels: mockLabels,
    };

    const vm = useResultCardVM(props);

    expect(vm.domainLabel).toBe("Cybersecurity");
    expect(vm.completedTagText).toBe("Concluída · 95/100");
  });
});
