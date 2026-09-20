// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { EnglishStepView } from "../index";
import * as viewModelModule from "../englishStep.viewmodel";
import type { EnglishStepViewModelReturn } from "../englishStep.types";
import { AppProviders } from "@/shared/providers";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("EnglishStepView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  const mockLabels = {
    stepTag: "PRÉ-QUESTIONÁRIO · NÍVEL DE PROFICIÊNCIA EM INGLÊS",
    title: "Nível de proficiência em inglês",
    description: "Isso nos ajuda a calibrar a complexidade das perguntas.",
    questionLabel: "Nível de proficiência em inglês",
    options: {
      none: "Nenhum",
      "basic-reading": "Básico - Leitura",
      "intermediate-reading-writing": "Intermediário - Leitura e Escritura",
      "advanced-fluent": "Avançado - Fluente",
    },
    backLabel: "Voltar",
    backAriaLabel: "Voltar para etapa anterior",
    continueLabel: "Continuar",
    savingLabel: "Salvando...",
    exitLabel: "Sair",
    exitAriaLabel: "Sair do pré-questionário",
    exitModal: {
      title: "Deseja sair do pré-questionário?",
      description: "Suas respostas anteriores já foram salvas.",
      cancelButton: "Continuar respondendo",
      confirmButton: "Sair da jornada",
    },
    loadingText: "Carregando pergunta...",
    errorTitle: "Erro",
    errorMessage: "Falha ao carregar.",
    retryButton: "Tentar novamente",
  };

  const mockOptions = [
    { id: "none" as const, label: "Nenhum" },
    { id: "basic-reading" as const, label: "Básico - Leitura" },
    { id: "intermediate-reading-writing" as const, label: "Intermediário - Leitura e Escritura" },
    { id: "advanced-fluent" as const, label: "Avançado - Fluente" },
  ];

  function createMockVMReturn(
    overrides?: Partial<EnglishStepViewModelReturn>
  ): EnglishStepViewModelReturn {
    return {
      journeySlug: "data-governance",
      journeyTitle: "Governança de Dados",
      selectedOption: null,
      isLoading: false,
      isSubmitting: false,
      isExitModalOpen: false,
      error: null,
      options: mockOptions,
      labels: mockLabels,
      handleSelectOption: vi.fn(),
      handleContinue: vi.fn(),
      handleBack: undefined,
      handleExit: vi.fn(),
      handleCancelExit: vi.fn(),
      handleConfirmExit: vi.fn(),
      handleRetry: vi.fn(),
      ...overrides,
    };
  }

  it("deve renderizar o skeleton enquanto isLoading for true", () => {
    vi.spyOn(viewModelModule, "useEnglishStepVM").mockReturnValue(
      createMockVMReturn({ isLoading: true })
    );

    render(
      <AppProviders>
        <EnglishStepView journeySlug="data-governance" />
      </AppProviders>
    );

    expect(screen.getByTestId("english-step-skeleton")).toBeDefined();
    expect(screen.queryByText("Nível de proficiência em inglês")).toBeNull();
  });

  it("deve renderizar o título, opções de resposta e o botão continuar desabilitado sem seleção", () => {
    vi.spyOn(viewModelModule, "useEnglishStepVM").mockReturnValue(
      createMockVMReturn({ selectedOption: null })
    );

    render(
      <AppProviders>
        <EnglishStepView journeySlug="data-governance" />
      </AppProviders>
    );

    expect(screen.getAllByText("Nível de proficiência em inglês").length).toBeGreaterThan(0);
    expect(screen.getByText("Nenhum")).toBeDefined();
    expect(screen.getByText("Básico - Leitura")).toBeDefined();
    expect(screen.getByText("Intermediário - Leitura e Escritura")).toBeDefined();
    expect(screen.getByText("Avançado - Fluente")).toBeDefined();

    const continueButton = screen.getByText("Continuar").closest("button");
    expect(continueButton?.disabled).toBe(true);
  });

  it("deve habilitar o botão continuar quando uma opção estiver selecionada e chamar handleContinue no clique", () => {
    const handleContinueMock = vi.fn();
    vi.spyOn(viewModelModule, "useEnglishStepVM").mockReturnValue(
      createMockVMReturn({
        selectedOption: "basic-reading",
        handleContinue: handleContinueMock,
      })
    );

    render(
      <AppProviders>
        <EnglishStepView journeySlug="data-governance" />
      </AppProviders>
    );

    const continueButton = screen.getByText("Continuar").closest("button");
    expect(continueButton?.disabled).toBe(false);

    fireEvent.click(continueButton!);
    expect(handleContinueMock).toHaveBeenCalled();
  });

  it("deve exibir savingLabel durante o salvamento (isSubmitting = true)", () => {
    vi.spyOn(viewModelModule, "useEnglishStepVM").mockReturnValue(
      createMockVMReturn({
        selectedOption: "basic-reading",
        isSubmitting: true,
      })
    );

    render(
      <AppProviders>
        <EnglishStepView journeySlug="data-governance" />
      </AppProviders>
    );

    expect(screen.getByText("Salvando...")).toBeDefined();
    expect(screen.queryByText("Continuar")).toBeNull();
  });

  it("deve chamar handleExit ao clicar no botão Sair", () => {
    const handleExitMock = vi.fn();
    vi.spyOn(viewModelModule, "useEnglishStepVM").mockReturnValue(
      createMockVMReturn({
        handleExit: handleExitMock,
      })
    );

    render(
      <AppProviders>
        <EnglishStepView journeySlug="data-governance" />
      </AppProviders>
    );

    const exitButton = screen.getByText("Sair").closest("button");
    fireEvent.click(exitButton!);

    expect(handleExitMock).toHaveBeenCalled();
  });

  it("deve exibir o banner de erro com role alert e chamar handleRetry ao clicar em tentar novamente", () => {
    const handleRetryMock = vi.fn();
    vi.spyOn(viewModelModule, "useEnglishStepVM").mockReturnValue(
      createMockVMReturn({
        error: "Falha ao carregar.",
        handleRetry: handleRetryMock,
      })
    );

    render(
      <AppProviders>
        <EnglishStepView journeySlug="data-governance" />
      </AppProviders>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(screen.getByText("Falha ao carregar.")).toBeDefined();

    const retryBtn = screen.getByText("Tentar novamente");
    fireEvent.click(retryBtn);
    expect(handleRetryMock).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o modal de saída quando isExitModalOpen for true e acionar callbacks de cancelar e confirmar", () => {
    const handleCancelExitMock = vi.fn();
    const handleConfirmExitMock = vi.fn();

    vi.spyOn(viewModelModule, "useEnglishStepVM").mockReturnValue(
      createMockVMReturn({
        isExitModalOpen: true,
        handleCancelExit: handleCancelExitMock,
        handleConfirmExit: handleConfirmExitMock,
      })
    );

    render(
      <AppProviders>
        <EnglishStepView journeySlug="data-governance" />
      </AppProviders>
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Deseja sair do pré-questionário?")).toBeDefined();

    const cancelBtn = screen.getByText("Continuar respondendo");
    fireEvent.click(cancelBtn);
    expect(handleCancelExitMock).toHaveBeenCalledTimes(1);

    const confirmBtn = screen.getByText("Sair da jornada");
    fireEvent.click(confirmBtn);
    expect(handleConfirmExitMock).toHaveBeenCalledTimes(1);
  });
});
