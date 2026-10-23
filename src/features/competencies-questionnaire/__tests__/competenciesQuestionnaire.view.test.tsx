// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CompetenciesQuestionnaireView } from "../index";
import * as viewModelModule from "../competenciesQuestionnaire.viewmodel";
import type { CompetenciesQuestionnaireViewModelReturn } from "../competenciesQuestionnaire.types";

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  Link: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function createVM(
  overrides?: Partial<CompetenciesQuestionnaireViewModelReturn>
): CompetenciesQuestionnaireViewModelReturn {
  return {
    journeyTitle: "Encarregado de Dados",
    currentArea: {
      id: "1",
      name: "Governança",
      description: null,
      competencies: [
        { id: 2, name: "Competência 2", description: "Descrição 2", difficulty: { level: "basic", label: "Básico" } },
        { id: 3, name: "Competência 3", description: "Descrição 3", difficulty: null },
      ],
    },
    areaIndex: 0,
    totalAreas: 3,
    progressPercent: 25,
    areaAnsweredCount: 1,
    areaTotalCount: 2,
    answers: { 2: true },
    isLastArea: false,
    isNextDisabled: true,
    isLoading: false,
    isSubmitting: false,
    error: null,
    errorLink: null,
    canRetry: true,
    isJourneyNotFound: false,
    isJourneyAlreadyFinished: false,
    isExitModalOpen: false,
    journeysHref: "/jornadas",
    resultsHref: "/resultados",
    labels: {
      journeyLabel: "Encarregado de Dados",
      areaIndicator: "Área 1 / 3",
      progressAriaLabel: "Progresso do questionário de competências",
      areaDescriptionPlaceholder: "(descrição da área de conhecimento vai aqui)",
      instruction: "Para cada competência abaixo, marque Sim ou Não.",
      areaCounter: "1 / 2 respondidas nesta área",
      yesLabel: "Sim",
      noLabel: "Não",
      difficultyPrefix: "Nível",
      emptyLabel: "Nenhuma competência encontrada para esta jornada.",
      backLabel: "Voltar",
      backAriaLabel: "Voltar para a etapa anterior",
      nextLabel: "Próxima área",
      savingLabel: "Salvando...",
      exitLabel: "Sair",
      exitAriaLabel: "Sair do pré-questionário",
      exitModal: {
        title: "Deseja sair do pré-questionário?",
        description: "As respostas já salvas serão mantidas.",
        cancelButton: "Continuar respondendo",
        confirmButton: "Sair",
      },
      loadingText: "Carregando competências...",
      retryButton: "Tentar novamente",
      summaryLink: "Ver resumo da jornada",
      noOngoingJourneyTitle: "Nenhuma jornada em andamento",
      noOngoingJourneyMessage: "Não encontramos uma jornada em andamento para você.",
      backToJourneysLink: "Voltar para jornadas",
      alreadyFinishedTitle: "Jornada já finalizada",
      alreadyFinishedMessage: "Esta jornada já foi finalizada.",
      goToResultsLink: "Ir para Resultados",
    },
    handleAnswer: vi.fn(),
    handleNext: vi.fn(),
    handleBack: vi.fn(),
    handleExit: vi.fn(),
    handleCancelExit: vi.fn(),
    handleConfirmExit: vi.fn(),
    handleRetry: vi.fn(),
    ...overrides,
  };
}

function mockVM(overrides?: Partial<CompetenciesQuestionnaireViewModelReturn>) {
  const vm = createVM(overrides);
  vi.spyOn(viewModelModule, "useCompetenciesQuestionnaireVM").mockReturnValue(vm);
  return vm;
}

describe("CompetenciesQuestionnaireView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar o cabeçalho da área, as competências e o contador anunciado", () => {
    mockVM();
    render(<CompetenciesQuestionnaireView areaIndexParam="0" />);

    expect(screen.getByText("Área 1 / 3")).toBeDefined();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("25");
    expect(screen.getByText("Encarregado de Dados")).toBeDefined();
    const title = screen.getByRole("heading", { level: 1, name: "Governança" });
    expect(document.activeElement).toBe(title);
    expect(screen.getByText("(descrição da área de conhecimento vai aqui)")).toBeDefined();
    expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
    expect(screen.getByText("1 / 2 respondidas nesta área").getAttribute("aria-live")).toBe("polite");
  });

  it("deve exibir a descrição da área quando o backend a retornar", () => {
    const vm = createVM();
    mockVM({ currentArea: { ...vm.currentArea!, description: "Políticas e responsabilidades." } });
    render(<CompetenciesQuestionnaireView areaIndexParam="0" />);

    expect(screen.getByText("Políticas e responsabilidades.")).toBeDefined();
    expect(screen.queryByText("(descrição da área de conhecimento vai aqui)")).toBeNull();
  });

  it("deve manter o avançar focável com aria-disabled e repassar respostas e navegação", () => {
    const vm = mockVM();
    render(<CompetenciesQuestionnaireView areaIndexParam="0" />);

    const next = screen.getByRole("button", { name: /Próxima área/ });
    expect(next.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(next);
    expect(vm.handleNext).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByRole("radio", { name: "Não" })[1]);
    expect(vm.handleAnswer).toHaveBeenCalledWith(3, false);

    fireEvent.click(screen.getByRole("button", { name: "Voltar para a etapa anterior" }));
    expect(vm.handleBack).toHaveBeenCalledTimes(1);
  });

  it("deve exibir o skeleton durante o carregamento", () => {
    mockVM({ isLoading: true });
    render(<CompetenciesQuestionnaireView areaIndexParam="0" />);

    expect(screen.getByTestId("competencies-questionnaire-skeleton")).toBeDefined();
  });

  it("deve exibir o estado de jornada não encontrada", () => {
    mockVM({ isJourneyNotFound: true });
    render(<CompetenciesQuestionnaireView areaIndexParam="0" />);

    expect(screen.getByText("Nenhuma jornada em andamento")).toBeDefined();
    expect(screen.getByRole("link", { name: "Voltar para jornadas" }).getAttribute("href")).toBe(
      "/jornadas"
    );
  });

  it("deve exibir o estado de jornada já finalizada com link para Resultados", () => {
    mockVM({ isJourneyAlreadyFinished: true });
    render(<CompetenciesQuestionnaireView areaIndexParam="0" />);

    expect(screen.getByText("Jornada já finalizada")).toBeDefined();
    expect(screen.getByRole("link", { name: "Ir para Resultados" }).getAttribute("href")).toBe(
      "/resultados"
    );
  });

  it("deve exibir o erro de jornada incompleta com link para o resumo e sem nova tentativa", () => {
    mockVM({
      error: "Existem etapas obrigatorias pendentes.",
      errorLink: { label: "Ver resumo da jornada", href: "/jornada/78" },
      canRetry: false,
    });
    render(<CompetenciesQuestionnaireView areaIndexParam="2" />);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Existem etapas obrigatorias pendentes.");
    expect(screen.getByRole("link", { name: "Ver resumo da jornada" }).getAttribute("href")).toBe(
      "/jornada/78"
    );
    expect(screen.queryByText("Tentar novamente")).toBeNull();
  });

  it("deve exibir o estado vazio quando a jornada não tiver competências", () => {
    mockVM({ currentArea: null, totalAreas: 0 });
    render(<CompetenciesQuestionnaireView areaIndexParam="0" />);

    expect(screen.getByRole("status").textContent).toBe(
      "Nenhuma competência encontrada para esta jornada."
    );
  });
});
