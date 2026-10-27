// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ExperienceStepView } from "../index";
import * as viewModelModule from "../experienceStep.viewmodel";
import type {
  ExperienceStepLabels,
  ExperienceStepViewModelReturn,
} from "../experienceStep.types";
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
  usePathname: () => "/jornada/10/experiencia-profissional",
  Link: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("ExperienceStepView", () => {
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

  const mockLabels: ExperienceStepLabels = {
    stepTag: "PRÉ-QUESTIONÁRIO · EXPERIÊNCIA PROFISSIONAL",
    title: "Conte sobre sua experiência profissional",
    description: "Tempo de experiência profissional.",
    questionLabels: {
      privacy: "Pergunta privacidade",
      security: "Pergunta segurança",
      joint: "Pergunta conjunta",
    },
    options: {
      none: "Nenhum",
      "less-than-1-year": "Menos de 1 ano",
      "1-3-years": "Entre 1 e 3 anos",
      "4-6-years": "Entre 4 e 6 anos",
      "7-10-years": "Entre 7 e 10 anos",
      "10-plus-years": "Mais de 10 anos",
    },
    backLabel: "Voltar",
    backAriaLabel: "Voltar para o resumo da jornada",
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
    notFoundTitle: "Jornada não encontrada",
    notFoundMessage: "Não encontramos a jornada.",
    backToJourneysLink: "Voltar para jornadas",
  };

  const mockOptions = (
    Object.keys(mockLabels.options) as (keyof ExperienceStepLabels["options"])[]
  ).map((id) => ({ id, label: mockLabels.options[id] }));

  function createMockVMReturn(
    overrides?: Partial<ExperienceStepViewModelReturn>
  ): ExperienceStepViewModelReturn {
    return {
      journeyTitle: "Encarregado de Dados",
      questionLabel: "Pergunta privacidade",
      selectedOption: null,
      isLoading: false,
      isSubmitting: false,
      isContinueDisabled: false,
      isNotFound: false,
      isExitModalOpen: false,
      error: null,
      options: mockOptions,
      labels: mockLabels,
      journeysHref: "/jornadas",
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

  function renderView(overrides?: Partial<ExperienceStepViewModelReturn>) {
    const vm = createMockVMReturn(overrides);
    vi.spyOn(viewModelModule, "useExperienceStepVM").mockReturnValue(vm);
    render(
      <AppProviders>
        <ExperienceStepView />
      </AppProviders>
    );
    return vm;
  }

  it("deve renderizar o skeleton enquanto isLoading for true", () => {
    renderView({ isLoading: true });

    expect(screen.getByTestId("experience-step-skeleton")).toBeDefined();
    expect(screen.queryByText(mockLabels.title)).toBeNull();
  });

  it("deve renderizar tag, título, nome do perfil, pergunta e as 6 opções", () => {
    renderView();

    expect(screen.getByText(mockLabels.stepTag)).toBeDefined();
    expect(screen.getByText(mockLabels.title)).toBeDefined();
    expect(screen.getByText("Encarregado de Dados")).toBeDefined();
    expect(screen.getByText("Pergunta privacidade")).toBeDefined();
    expect(screen.getAllByRole("radio")).toHaveLength(6);

    const continueButton = screen.getByText("Continuar").closest("button");
    expect(continueButton?.disabled).toBe(true);
  });

  it("deve habilitar Continuar com seleção e chamar handleContinue no clique", () => {
    const vm = renderView({ selectedOption: "1-3-years" });

    const continueButton = screen.getByText("Continuar").closest("button");
    expect(continueButton?.disabled).toBe(false);

    fireEvent.click(continueButton!);
    expect(vm.handleContinue).toHaveBeenCalled();
  });

  it("deve manter Continuar desabilitado quando isContinueDisabled for true, mesmo com seleção", () => {
    renderView({ selectedOption: "1-3-years", isContinueDisabled: true });

    const continueButton = screen.getByText("Continuar").closest("button");
    expect(continueButton?.disabled).toBe(true);
  });

  it("deve exibir o botão Voltar e chamar handleBack no clique", () => {
    const vm = renderView();

    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para o resumo da jornada" })
    );
    expect(vm.handleBack).toHaveBeenCalledTimes(1);
  });

  it("deve exibir o banner de erro e chamar handleRetry", () => {
    const vm = renderView({ error: "Falha ao carregar." });

    expect(screen.getByRole("alert")).toBeDefined();
    fireEvent.click(screen.getByText("Tentar novamente"));
    expect(vm.handleRetry).toHaveBeenCalledTimes(1);
  });

  it("deve exibir o estado de jornada não encontrada com link para /jornadas", () => {
    renderView({ isNotFound: true });

    expect(screen.getByTestId("journey-not-found-state")).toBeDefined();
    expect(screen.getByText("Jornada não encontrada")).toBeDefined();
    const link = screen.getByText("Voltar para jornadas").closest("a");
    expect(link?.getAttribute("href")).toBe("/jornadas");
    expect(screen.queryByText(mockLabels.title)).toBeNull();
  });

  it("deve renderizar o modal de saída e acionar cancelar e confirmar", () => {
    const vm = renderView({ isExitModalOpen: true });

    expect(screen.getByRole("dialog")).toBeDefined();
    fireEvent.click(screen.getByText("Continuar respondendo"));
    expect(vm.handleCancelExit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Sair da jornada"));
    expect(vm.handleConfirmExit).toHaveBeenCalledTimes(1);
  });
});
