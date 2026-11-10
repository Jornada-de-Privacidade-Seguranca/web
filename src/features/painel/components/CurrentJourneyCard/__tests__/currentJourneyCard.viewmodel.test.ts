// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCurrentJourneyCardVM } from "../currentJourneyCard.viewmodel";
import type { CurrentJourneyCardProps } from "../currentJourneyCard.types";
import type { PendingAssessment } from "../../../painel.types";

const mockJourney: PendingAssessment = {
  id: "j1",
  title: "Trilha de Privacidade",
  description: "Descrição da trilha",
  status: "in_progress",
  totalQuestions: 10,
  estimatedMinutes: 4,
};

function props(overrides: Partial<CurrentJourneyCardProps> = {}): CurrentJourneyCardProps {
  return {
    journey: mockJourney,
    sectionTitle: "Jornada em andamento",
    emptyMessage: "Nenhuma jornada",
    exploreCtaText: "Explorar",
    startCtaText: "Iniciar jornada",
    continueCtaText: "Continuar jornada",
    questionsText: "10 perguntas",
    timeText: "4 min",
    badgeLabel: "EM ANDAMENTO",
    badgeVariant: "in_progress",
    ...overrides,
  };
}

describe("useCurrentJourneyCardVM", () => {
  it("deve continuar pelas competências quando a jornada já tiver sido iniciada", () => {
    const { result } = renderHook(() => useCurrentJourneyCardVM(props()));

    expect(result.current.actionHref).toBe("/jornada/atual/competencias/0");
    expect(result.current.actionText).toBe("Continuar jornada");
  });

  it("deve iniciar pelo resumo da jornada quando ela ainda não tiver sido iniciada", () => {
    const { result } = renderHook(() =>
      useCurrentJourneyCardVM(props({ journey: { ...mockJourney, status: "pending" } }))
    );

    expect(result.current.actionHref).toBe("/jornada/j1");
    expect(result.current.actionText).toBe("Iniciar jornada");
  });

  it("deve apontar para /jornadas quando não houver jornada ativa", () => {
    const { result } = renderHook(() => useCurrentJourneyCardVM(props({ journey: null })));

    expect(result.current.actionHref).toBe("/jornadas");
    expect(result.current.journey).toBeNull();
  });

  it("deve repassar perguntas e tempo, inclusive nulos", () => {
    const { result } = renderHook(() =>
      useCurrentJourneyCardVM(props({ questionsText: null, timeText: null }))
    );

    expect(result.current.questionsText).toBeNull();
    expect(result.current.timeText).toBeNull();
  });
});
