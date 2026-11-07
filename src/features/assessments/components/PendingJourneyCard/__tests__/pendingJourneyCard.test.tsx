// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PendingJourneyCard } from "../index";
import type { Journey, AssessmentsLabels } from "../../../assessments.types";

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockLabels: AssessmentsLabels = {
  title: "Jornadas",
  subtitle: "Trilhas de conhecimento",
  pendingSectionTitle: "Jornada em andamento",
  pendingSectionSubtitle: "Jornada disponível para você responder.",
  pendingEmpty: "Nenhuma jornada",
  catalogSectionTitle: "Todas as jornadas",
  catalogSectionSubtitle: "Catálogo",
  catalogSearchPlaceholder: "Buscar",
  catalogEmpty: "Vazio",
  statusCompleted: "Concluída",
  statusInProgress: "Pendente",
  statusNotStarted: "Não realizada",
  actionStart: "Iniciar jornada",
  actionContinue: "Continuar jornada",
  actionRetake: "Refazer jornada",
  actionCancel: "Cancelar jornada",
  assignedBadge: "Atribuída",
  inProgressBadge: "Em andamento",
  completedScoreBadge: (score) => `Concluída · ${score}/100`,
  competenciesCount: (count) => `${count} competências`,
  questionsCount: (count) => `${count} perguntas`,
  estimatedMinutes: (minutes) => `${minutes} min`,
  filtersButton: "Filtros",
  filtersButtonWithCount: (count) => `Filtros (${count})`,
  filtersPanelTitle: "Filtros",
  filtersClear: "Limpar",
  filterDomainTitle: "Domínio",
  filterDomainPrivacy: "Privacidade",
  filterDomainSecurity: "Segurança da Informação",
  filterDomainJoint: "Conjunta",
  filterStatusTitle: "Situação",
  filterStatusCompleted: "Concluída",
  filterStatusNotStarted: "Não realizada",
  filterStatusInProgress: "Pendente",
  cancelModalTitle: "Cancelar jornada",
  cancelModalDescription: "Tem certeza?",
  cancelModalKeep: "Manter",
  cancelModalConfirm: "Cancelar",
  paginationPrevious: "Anterior",
  paginationNext: "Próximo",
  paginationPageOf: (c, t) => `Página ${c} de ${t}`,
  errorTitle: "Erro",
  errorMessage: "Erro",
  retryButton: "Tentar",
  loadingAriaLabel: "Carregando",
};

describe("PendingJourneyCard Component", () => {
  it("deve renderizar jornada iniciada pelo usuário com botão 'Continuar jornada' e opção de cancelar", () => {
    const onCancelMock = vi.fn();
    const journey: Journey = {
      id: "j-1",
      title: "Segurança em Nuvem",
      description: "Fundamentos de segurança",
      status: "in_progress",
      domain: "security",
      competenciesCount: 15,
      estimatedMinutes: 20,
      isSelfStarted: true,
      origin: "self_started",
    };

    render(
      <PendingJourneyCard
        journey={journey}
        labels={mockLabels}
        onCancelJourney={onCancelMock}
      />
    );

    expect(screen.getByText("Segurança em Nuvem")).toBeDefined();
    expect(screen.getByText("15 competências")).toBeDefined();
    expect(screen.getByText("20 min")).toBeDefined();
    expect(screen.getByRole("link", { name: /Continuar jornada/i })).toBeDefined();

    const cancelBtn = screen.getByRole("button", { name: /Cancelar jornada/i });
    expect(cancelBtn).toBeDefined();
    fireEvent.click(cancelBtn);
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar jornada atribuída com botão 'Iniciar jornada' e SEM opção de cancelar", () => {
    const onCancelMock = vi.fn();
    const journey: Journey = {
      id: "j-assigned",
      title: "LGPD Corporativa",
      description: "Trilha corporativa atribuída pelo gestor",
      status: "not_started",
      domain: "privacy",
      competenciesCount: 10,
      estimatedMinutes: 15,
      isSelfStarted: false,
      origin: "assigned",
    };

    render(
      <PendingJourneyCard
        journey={journey}
        labels={mockLabels}
        onCancelJourney={onCancelMock}
      />
    );

    expect(screen.getByText("LGPD Corporativa")).toBeDefined();
    expect(screen.getByText("Atribuída")).toBeDefined();
    expect(screen.getByRole("link", { name: /Iniciar jornada/i })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Cancelar jornada/i })).toBeNull();
  });
});

