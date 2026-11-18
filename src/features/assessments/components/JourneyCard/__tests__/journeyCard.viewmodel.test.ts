// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useJourneyCardVM } from "../journeyCard.viewmodel";
import type { Journey, AssessmentsLabels } from "@features/assessments/assessments.types";

const mockLabels: AssessmentsLabels = {
  title: "Jornadas",
  subtitle: "Subtítulo",
  pendingSectionTitle: "Jornada em andamento",
  pendingSectionSubtitle: "Jornada disponível para você responder.",
  pendingEmpty: "Vazio",
  catalogSectionTitle: "Catálogo",
  catalogSectionSubtitle: "Subtítulo",
  catalogSearchPlaceholder: "Buscar...",
  catalogEmpty: "Nenhum",
  statusCompleted: "Concluída",
  statusInProgress: "Pendente",
  statusNotStarted: "Não realizada",
  actionStart: "Iniciar jornada",
  actionContinue: "Continuar jornada",
  actionRetake: "Refazer jornada",
  actionCancel: "Cancelar jornada",
  assignedBadge: "Atribuída",
  inProgressBadge: "Em andamento",
  assignedBy: (name: string) => `Atribuída por ${name}`,
  onlyAssignerCanCancel: "Apenas quem atribuiu pode cancelar.",
  completedScoreBadge: (score: number) => `Concluída · ${score}/100`,
  competenciesCount: (count: number) => `${count} competências`,
  questionsCount: (count: number) => `${count} perguntas`,
  estimatedMinutes: (minutes: number) => `${minutes} min`,
  filtersButton: "Filtros",
  filtersButtonWithCount: (count: number) => `Filtros (${count})`,
  filtersPanelTitle: "Filtrar",
  filtersClear: "Limpar",
  filterDomainTitle: "Domínio",
  filterDomainPrivacy: "Privacidade",
  filterDomainSecurity: "Segurança da Informação",
  filterDomainJoint: "Conjunta",
  filterStatusTitle: "Situação",
  filterStatusCompleted: "Concluída",
  filterStatusNotStarted: "Não realizada",
  filterStatusInProgress: "Pendente",
  cancelModalTitle: "Cancelar",
  cancelModalDescription: "Tem certeza?",
  cancelModalKeep: "Manter",
  cancelModalConfirm: "Cancelar",
  cancelModalConfirming: "Cancelando...",
  cancelSuccess: "Jornada cancelada.",
  cancelError: "Não foi possível cancelar a jornada.",
  cancelNotAllowed: "Esta jornada não pode mais ser cancelada.",
  cancelUnavailable: "Esta jornada não está mais disponível.",
  closeMessage: "Fechar aviso",
  paginationPrevious: "Anterior",
  paginationNext: "Próximo",
  paginationPageOf: (current: number, total: number) => `Página ${current} de ${total}`,
  errorTitle: "Erro",
  errorMessage: "Mensagem de erro",
  retryButton: "Tentar novamente",
  loadingAriaLabel: "Carregando",
};

describe("useJourneyCardVM", () => {
  it("deve formatar competências, tempo e domínio e ativar hasMeta", () => {
    const journey: Journey = {
      id: "1",
      title: "Segurança Digital",
      description: "Descrição",
      domain: "security",
      competenciesCount: 15,
      estimatedMinutes: 20,
      status: "in_progress",
    };

    const { result } = renderHook(() =>
      useJourneyCardVM({ journey, labels: mockLabels })
    );

    expect(result.current.competenciesText).toBe("15 competências");
    expect(result.current.timeText).toBe("20 min");
    expect(result.current.domainLabel).toBe("Segurança da Informação");
    expect(result.current.hasMeta).toBe(true);
  });

  it("deve exibir tag 'Concluída · x/100' com a última nota para jornadas concluídas", () => {
    const journey: Journey = {
      id: "2",
      title: "LGPD Fundamentos",
      description: "Descrição",
      status: "completed",
      score: 85,
    };

    const { result } = renderHook(() =>
      useJourneyCardVM({ journey, labels: mockLabels })
    );

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.badgeText).toBe("Concluída · 85/100");
    expect(result.current.buttonText).toBe("Refazer jornada");
    expect(result.current.buttonVariant).toBe("outline");
  });

  it("deve exibir botão 'Iniciar jornada' para jornadas não realizadas", () => {
    const journey: Journey = {
      id: "3",
      title: "Governança de Dados",
      description: "Descrição",
      status: "not_started",
      href: "/jornada/perfil/3",
    };

    const { result } = renderHook(() =>
      useJourneyCardVM({ journey, labels: mockLabels })
    );

    expect(result.current.isNotStarted).toBe(true);
    expect(result.current.badgeText).toBe("Não realizada");
    expect(result.current.buttonText).toBe("Iniciar jornada");
    expect(result.current.actionHref).toBe("/jornada/perfil/3");
  });
});
