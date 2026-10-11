// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useJourneyCardVM } from "../journeyCard.viewmodel";
import type { Journey, AssessmentsLabels } from "@features/assessments/assessments.types";

const mockLabels: AssessmentsLabels = {
  title: "Jornadas",
  subtitle: "Subtítulo",
  pendingSectionTitle: "Pendentes",
  pendingSectionSubtitle: "Subtítulo",
  pendingEmpty: "Vazio",
  catalogSectionTitle: "Catálogo",
  catalogSectionSubtitle: "Subtítulo",
  catalogSearchPlaceholder: "Buscar...",
  catalogEmpty: "Nenhum",
  statusCompleted: "Concluída",
  statusInProgress: "Em andamento",
  statusNotStarted: "Não iniciada",
  actionStart: "Iniciar avaliação",
  actionContinue: "Continuar avaliação",
  actionRetake: "Refazer jornada",
  questionsCount: (count: number) => `${count} perguntas`,
  estimatedMinutes: (minutes: number) => `${minutes} min`,
  paginationPrevious: "Anterior",
  paginationNext: "Próximo",
  paginationPageOf: (current: number, total: number) => `Página ${current} de ${total}`,
  errorTitle: "Erro",
  errorMessage: "Mensagem de erro",
  retryButton: "Tentar novamente",
  loadingAriaLabel: "Carregando",
};

describe("useJourneyCardVM", () => {
  it("deve formatar perguntas e tempo e ativar hasMeta quando ambos estiverem presentes", () => {
    const journey: Journey = {
      id: "1",
      title: "Segurança Digital",
      description: "Descrição",
      totalQuestions: 10,
      estimatedMinutes: 20,
      status: "in_progress",
    };

    const { result } = renderHook(() =>
      useJourneyCardVM({ journey, labels: mockLabels })
    );

    expect(result.current.questionsText).toBe("10 perguntas");
    expect(result.current.timeText).toBe("20 min");
    expect(result.current.hasMeta).toBe(true);
  });

  it("deve definir questionsText e timeText como null e hasMeta como false quando não houver perguntas nem duração", () => {
    const journey: Journey = {
      id: "2",
      title: "Privacidade",
      description: "Descrição",
      status: "in_progress",
    };

    const { result } = renderHook(() =>
      useJourneyCardVM({ journey, labels: mockLabels })
    );

    expect(result.current.questionsText).toBeNull();
    expect(result.current.timeText).toBeNull();
    expect(result.current.hasMeta).toBe(false);
  });

  it("deve tolerar null em totalQuestions e estimatedMinutes sem quebrar", () => {
    const journey: Journey = {
      id: "3",
      title: "LGPD",
      description: "Descrição",
      totalQuestions: undefined,
      estimatedMinutes: undefined,
      status: "in_progress",
    };

    const { result } = renderHook(() =>
      useJourneyCardVM({ journey, labels: mockLabels })
    );

    expect(result.current.questionsText).toBeNull();
    expect(result.current.timeText).toBeNull();
    expect(result.current.hasMeta).toBe(false);
  });

  it("deve manter hasMeta como true quando apenas uma das propriedades estiver presente", () => {
    const journeyOnlyQuestions: Journey = {
      id: "4",
      title: "Jornada A",
      description: "Descrição",
      totalQuestions: 5,
      status: "in_progress",
    };

    const { result: res1 } = renderHook(() =>
      useJourneyCardVM({ journey: journeyOnlyQuestions, labels: mockLabels })
    );
    expect(res1.current.questionsText).toBe("5 perguntas");
    expect(res1.current.timeText).toBeNull();
    expect(res1.current.hasMeta).toBe(true);

    const journeyOnlyTime: Journey = {
      id: "5",
      title: "Jornada B",
      description: "Descrição",
      estimatedMinutes: 15,
      status: "in_progress",
    };

    const { result: res2 } = renderHook(() =>
      useJourneyCardVM({ journey: journeyOnlyTime, labels: mockLabels })
    );
    expect(res2.current.questionsText).toBeNull();
    expect(res2.current.timeText).toBe("15 min");
    expect(res2.current.hasMeta).toBe(true);
  });

  it("deve configurar badges, botões e ações corretamente conforme o status", () => {
    const inProgress: Journey = {
      id: "1",
      title: "Trilha 1",
      description: "Desc",
      status: "in_progress",
    };
    const { result: resProgress } = renderHook(() =>
      useJourneyCardVM({ journey: inProgress, labels: mockLabels })
    );
    expect(resProgress.current.isInProgress).toBe(true);
    expect(resProgress.current.badgeText).toBe("Em andamento");
    expect(resProgress.current.buttonText).toBe("Continuar avaliação");
    expect(resProgress.current.buttonVariant).toBe("default");
    expect(resProgress.current.actionHref).toBe("/jornada/1");
    expect(resProgress.current.ctaAriaLabel).toBe("Continuar avaliação — Trilha 1");

    const completed: Journey = {
      id: "2",
      title: "Trilha 2",
      description: "Desc",
      status: "completed",
    };
    const { result: resCompleted } = renderHook(() =>
      useJourneyCardVM({ journey: completed, labels: mockLabels })
    );
    expect(resCompleted.current.isCompleted).toBe(true);
    expect(resCompleted.current.badgeText).toBe("Concluída");
    expect(resCompleted.current.buttonText).toBe("Refazer jornada");
    expect(resCompleted.current.buttonVariant).toBe("outline");

    const notStarted: Journey = {
      id: "3",
      title: "Trilha 3",
      description: "Desc",
      status: "not_started",
      href: "/custom-route",
    };
    const { result: resNotStarted } = renderHook(() =>
      useJourneyCardVM({ journey: notStarted, labels: mockLabels })
    );
    expect(resNotStarted.current.isNotStarted).toBe(true);
    expect(resNotStarted.current.badgeText).toBe("Não iniciada");
    expect(resNotStarted.current.buttonText).toBe("Iniciar avaliação");
    expect(resNotStarted.current.actionHref).toBe("/custom-route");
  });

  it("deve retornar ctaAriaLabel sem separador quando title for vazio", () => {
    const emptyTitleJourney: Journey = {
      id: "9",
      title: "",
      description: "Desc",
      status: "in_progress",
    };

    const { result } = renderHook(() =>
      useJourneyCardVM({ journey: emptyTitleJourney, labels: mockLabels })
    );
    expect(result.current.ctaAriaLabel).toBe("Continuar avaliação");
  });
});
