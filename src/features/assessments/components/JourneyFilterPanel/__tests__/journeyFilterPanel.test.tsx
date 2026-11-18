// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { JourneyFilterPanel } from "../index";
import type { AssessmentsLabels } from "../../../assessments.types";

const mockLabels: AssessmentsLabels = {
  title: "Jornadas",
  subtitle: "Trilhas",
  pendingSectionTitle: "Pendente",
  pendingSectionSubtitle: "Sub",
  pendingEmpty: "Vazio",
  catalogSectionTitle: "Catálogo",
  catalogSectionSubtitle: "Sub",
  catalogSearchPlaceholder: "Buscar",
  catalogEmpty: "Vazio",
  statusCompleted: "Concluída",
  statusInProgress: "Pendente",
  statusNotStarted: "Não realizada",
  actionStart: "Iniciar",
  actionContinue: "Continuar",
  actionRetake: "Refazer",
  actionCancel: "Cancelar",
  assignedBadge: "Atribuída",
  inProgressBadge: "Em andamento",
  assignedBy: (name: string) => `Atribuída por ${name}`,
  onlyAssignerCanCancel: "Apenas quem atribuiu pode cancelar.",
  completedScoreBadge: (score) => `Concluída · ${score}/100`,
  competenciesCount: (count) => `${count} competências`,
  questionsCount: (count) => `${count} perguntas`,
  estimatedMinutes: (minutes) => `${minutes} min`,
  filtersButton: "Filtros",
  filtersButtonWithCount: (count) => `Filtros (${count})`,
  filtersPanelTitle: "Filtrar jornadas",
  filtersClear: "Limpar filtros",
  filterDomainTitle: "Domínio",
  filterDomainPrivacy: "Privacidade",
  filterDomainSecurity: "Segurança da Informação",
  filterDomainJoint: "Conjunta",
  filterStatusTitle: "Situação",
  filterStatusCompleted: "Concluída",
  filterStatusNotStarted: "Não realizada",
  filterStatusInProgress: "Pendente",
  cancelModalTitle: "Cancelar",
  cancelModalDescription: "Desc",
  cancelModalKeep: "Manter",
  cancelModalConfirm: "Confirmar",
  paginationPrevious: "Ant",
  paginationNext: "Prox",
  paginationPageOf: (c, t) => `${c}/${t}`,
  errorTitle: "Erro",
  errorMessage: "Erro",
  retryButton: "Tentar",
  loadingAriaLabel: "Carregando",
};

describe("JourneyFilterPanel Component", () => {
  it("deve renderizar opções de Domínio e Situação e disparar alternâncias", () => {
    const onToggleDomainMock = vi.fn();
    const onToggleStatusMock = vi.fn();
    const onClearMock = vi.fn();

    render(
      <JourneyFilterPanel
        isOpen={true}
        filters={{ domains: ["privacy"], statuses: [] }}
        labels={mockLabels}
        onToggleDomain={onToggleDomainMock}
        onToggleStatus={onToggleStatusMock}
        onClearFilters={onClearMock}
      />
    );

    const privacyBtn = screen.getByRole("button", { name: "Privacidade" });
    expect(privacyBtn.getAttribute("aria-pressed")).toBe("true");

    const securityBtn = screen.getByRole("button", {
      name: "Segurança da Informação",
    });
    expect(securityBtn.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(securityBtn);
    expect(onToggleDomainMock).toHaveBeenCalledWith("security");

    const completedBtn = screen.getByRole("button", { name: "Concluída" });
    fireEvent.click(completedBtn);
    expect(onToggleStatusMock).toHaveBeenCalledWith("completed");

    const clearBtn = screen.getByRole("button", { name: "Limpar filtros" });
    fireEvent.click(clearBtn);
    expect(onClearMock).toHaveBeenCalledTimes(1);
  });
});

