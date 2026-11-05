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
  currentStep: "formacao-academica",
  progressPercent: 60,
  knowledgeDomain: "privacy",
};

describe("useCurrentJourneyCardVM", () => {
  it("deve montar link para a etapa atual da jornada em andamento", () => {
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

    expect(result.current.actionHref).toBe(
      "/jornada/atual/formacao-academica"
    );
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
});

