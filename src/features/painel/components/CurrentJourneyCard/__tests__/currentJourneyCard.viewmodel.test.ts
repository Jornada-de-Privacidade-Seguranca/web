// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCurrentJourneyCardVM } from "../currentJourneyCard.viewmodel";
import type { PendingAssessment } from "../../../painel.types";

const mockJourney: PendingAssessment = {
  id: "j1",
  title: "Trilha de Privacidade",
  description: "Descrição da trilha",
  status: "in_progress",
  totalQuestions: 10,
  estimatedMinutes: 15,
  progressPercent: 60,
  knowledgeDomain: "privacy",
};

describe("useCurrentJourneyCardVM", () => {
  it("deve apontar para a área 0 de competências quando a jornada estiver em andamento", () => {
    const { result } = renderHook(() =>
      useCurrentJourneyCardVM({
        journey: mockJourney,
        sectionTitle: "Jornada em andamento",
        emptyMessage: "Nenhuma jornada",
        exploreCtaText: "Explorar",
        continueCtaText: "Continuar",
        progressLabel: "Progresso",
        progressPercentLabel: "{percent}% concluído",
        badgeLabel: "EM ANDAMENTO",
        badgeVariant: "in_progress",
      })
    );

    expect(result.current.actionHref).toBe("/jornada/atual/competencias/0");
    expect(result.current.progressPercent).toBe(60);
    expect(result.current.progressPercentText).toBe("60% concluído");
  });

  it("deve apontar para /jornadas quando não houver jornada ativa", () => {
    const { result } = renderHook(() =>
      useCurrentJourneyCardVM({
        journey: null,
        sectionTitle: "Jornada em andamento",
        emptyMessage: "Nenhuma jornada",
        exploreCtaText: "Explorar",
        continueCtaText: "Continuar",
        progressLabel: "Progresso",
        progressPercentLabel: "{percent}% concluído",
        badgeLabel: "PENDENTE",
        badgeVariant: "pending",
      })
    );

    expect(result.current.actionHref).toBe("/jornadas");
    expect(result.current.journey).toBeNull();
  });

  it("deve apontar para o resumo da jornada quando status for pending", () => {
    const { result } = renderHook(() =>
      useCurrentJourneyCardVM({
        journey: { ...mockJourney, status: "pending" },
        sectionTitle: "Jornada em andamento",
        emptyMessage: "Nenhuma jornada",
        exploreCtaText: "Explorar",
        continueCtaText: "Iniciar",
        progressLabel: "Progresso",
        progressPercentLabel: "{percent}% concluído",
        badgeLabel: "PENDENTE",
        badgeVariant: "pending",
      })
    );

    expect(result.current.actionHref).toBe("/jornada/j1");
  });

  it("deve utilizar 0% de progresso quando a API não informar progressPercent", () => {
    const { result } = renderHook(() =>
      useCurrentJourneyCardVM({
        journey: { ...mockJourney, progressPercent: undefined },
        sectionTitle: "Jornada em andamento",
        emptyMessage: "Nenhuma jornada",
        exploreCtaText: "Explorar",
        continueCtaText: "Continuar",
        progressLabel: "Progresso",
        progressPercentLabel: "{percent}% concluído",
        badgeLabel: "EM ANDAMENTO",
        badgeVariant: "in_progress",
      })
    );

    expect(result.current.progressPercent).toBe(0);
    expect(result.current.progressPercentText).toBe("0% concluído");
  });
});

