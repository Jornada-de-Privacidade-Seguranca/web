// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { RoleTenureStepView } from "../index";
import * as viewModelModule from "../roleTenureStep.viewmodel";
import type { RoleTenureStepViewModelReturn } from "../roleTenureStep.types";
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
  usePathname: () => "/journey/data-governance/tempo-atuacao-perfil",
}));

describe("RoleTenureStepView", () => {
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
    stepTag: "PRÉ-QUESTIONÁRIO · TEMPO DE ATUAÇÃO NO PERFIL",
    title: "Tempo de atuação no perfil",
    description: "Isso nos ajuda a entender quanto tempo você atua nesse perfil.",
    questionLabel: "Tempo de atuação no perfil",
    options: {
      "0-years": "Nenhum",
      "1-3-years": "Entre 1 e 3 anos",
      "4-6-years": "Entre 4 e 6 anos",
      "7-10-years": "Entre 7 e 10 anos",
      "10-plus-years": "Mais de 10 anos",
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
    { id: "0-years" as const, label: "Nenhum" },
    { id: "1-3-years" as const, label: "Entre 1 e 3 anos" },
    { id: "4-6-years" as const, label: "Entre 4 e 6 anos" },
    { id: "7-10-years" as const, label: "Entre 7 e 10 anos" },
    { id: "10-plus-years" as const, label: "Mais de 10 anos" },
  ];

  function createMockVMReturn(
    overrides?: Partial<RoleTenureStepViewModelReturn>
  ): RoleTenureStepViewModelReturn {
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
      handleBack: vi.fn(),
      handleExit: vi.fn(),
      handleCancelExit: vi.fn(),
      handleConfirmExit: vi.fn(),
      handleRetry: vi.fn(),
      ...overrides,
    };
  }

  it("deve renderizar o skeleton enquanto isLoading for true", () => {
    vi.spyOn(viewModelModule, "useRoleTenureStepVM").mockReturnValue(
      createMockVMReturn({ isLoading: true })
    );

    render(
      <AppProviders>
        <RoleTenureStepView journeySlug="data-governance" />
      </AppProviders>
    );

    expect(screen.getByTestId("role-tenure-step-skeleton")).toBeDefined();
    expect(screen.queryByText("Tempo de atuação no perfil")).toBeNull();
  });

  it("deve renderizar o título, todas as 5 opções e o botão continuar desabilitado sem seleção", () => {
    vi.spyOn(viewModelModule, "useRoleTenureStepVM").mockReturnValue(
      createMockVMReturn({ selectedOption: null })
    );

    render(
      <AppProviders>
        <RoleTenureStepView journeySlug="data-governance" />
      </AppProviders>
    );

    expect(screen.getAllByText("Tempo de atuação no perfil").length).toBeGreaterThan(0);
    expect(screen.getByText("Nenhum")).toBeDefined();
    expect(screen.getByText("Entre 1 e 3 anos")).toBeDefined();
    expect(screen.getByText("Entre 4 e 6 anos")).toBeDefined();
    expect(screen.getByText("Entre 7 e 10 anos")).toBeDefined();
    expect(screen.getByText("Mais de 10 anos")).toBeDefined();

    const continueButton = screen.getByText("Continuar").closest("button");
    expect(continueButton?.disabled).toBe(true);
  });

  it("deve habilitar o botão continuar quando uma opção estiver selecionada e chamar handleContinue no clique", () => {
    const handleContinueMock = vi.fn();
    vi.spyOn(viewModelModule, "useRoleTenureStepVM").mockReturnValue(
      createMockVMReturn({
        selectedOption: "1-3-years",
        handleContinue: handleContinueMock,
      })
    );

    render(
      <AppProviders>
        <RoleTenureStepView journeySlug="data-governance" />
      </AppProviders>
    );

    const continueButton = screen.getByText("Continuar").closest("button");
    expect(continueButton?.disabled).toBe(false);

    fireEvent.click(continueButton!);
    expect(handleContinueMock).toHaveBeenCalled();
  });

  it("deve exibir savingLabel durante o salvamento (isSubmitting = true)", () => {
    vi.spyOn(viewModelModule, "useRoleTenureStepVM").mockReturnValue(
      createMockVMReturn({
        selectedOption: "1-3-years",
        isSubmitting: true,
      })
    );

    render(
      <AppProviders>
        <RoleTenureStepView journeySlug="data-governance" />
      </AppProviders>
    );

    expect(screen.getByText("Salvando...")).toBeDefined();
    expect(screen.queryByText("Continuar")).toBeNull();
  });

  it("deve chamar handleExit ao clicar no botão Sair", () => {
    const handleExitMock = vi.fn();
    vi.spyOn(viewModelModule, "useRoleTenureStepVM").mockReturnValue(
      createMockVMReturn({
        handleExit: handleExitMock,
      })
    );

    render(
      <AppProviders>
        <RoleTenureStepView journeySlug="data-governance" />
      </AppProviders>
    );

    const exitButton = screen.getByText("Sair").closest("button");
    fireEvent.click(exitButton!);

    expect(handleExitMock).toHaveBeenCalled();
  });

  it("deve exibir o banner de erro com role alert e chamar handleRetry ao clicar em tentar novamente", () => {
    const handleRetryMock = vi.fn();
    vi.spyOn(viewModelModule, "useRoleTenureStepVM").mockReturnValue(
      createMockVMReturn({
        error: "Falha ao carregar.",
        handleRetry: handleRetryMock,
      })
    );

    render(
      <AppProviders>
        <RoleTenureStepView journeySlug="data-governance" />
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

    vi.spyOn(viewModelModule, "useRoleTenureStepVM").mockReturnValue(
      createMockVMReturn({
        isExitModalOpen: true,
        handleCancelExit: handleCancelExitMock,
        handleConfirmExit: handleConfirmExitMock,
      })
    );

    render(
      <AppProviders>
        <RoleTenureStepView journeySlug="data-governance" />
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
