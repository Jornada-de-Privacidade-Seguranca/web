// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import {
  BookOpen01Icon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  Timer02Icon,
} from "@hugeicons/core-free-icons";
import { CompetenciesIntroView } from "../index";
import * as viewModelModule from "../competenciesIntro.viewmodel";
import type { CompetenciesIntroViewModelReturn } from "../competenciesIntro.types";

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  Link: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function createVM(
  overrides?: Partial<CompetenciesIntroViewModelReturn>,
): CompetenciesIntroViewModelReturn {
  return {
    journeyTitle: "Encarregado pelo Tratamento de Dados Pessoais",
    labels: {
      stepTag: "PRÉ-QUESTIONÁRIO · COMPETÊNCIAS",
      title: "Questionário de competências",
      subtitle: "Leia as instruções antes de iniciar o questionário.",
      intro: "A seguir, você responderá perguntas sobre privacidade.",
      tip: "Dica: ao concluir, você receberá um resultado detalhado.",
      instructionsAriaLabel: "Instruções do questionário",
      startLabel: "Iniciar questionário",
      backLabel: "Voltar",
      backAriaLabel: "Voltar para a etapa anterior",
      exitLabel: "Sair",
      exitAriaLabel: "Sair do pré-questionário",
      exitModal: {
        title: "Deseja sair do pré-questionário?",
        description: "Suas respostas anteriores já foram salvas.",
        cancelButton: "Continuar respondendo",
        confirmButton: "Sair",
      },
      loadingText: "Carregando instruções...",
      noOngoingJourneyTitle: "Nenhuma jornada em andamento",
      noOngoingJourneyMessage:
        "Não encontramos uma jornada em andamento para você.",
      backToJourneysLink: "Voltar para jornadas",
    },
    instructionItems: [
      {
        id: "objective",
        icon: CheckListIcon,
        title: "Questões objetivas",
        description: "Uma alternativa.",
        isLoading: false,
      },
      {
        id: "sincerity",
        icon: BookOpen01Icon,
        title: "Responda com sinceridade",
        description: "Sem penalidade.",
        isLoading: false,
      },
      {
        id: "navigation",
        icon: CheckmarkCircle02Icon,
        title: "Navegação livre",
        description: "Avance e volte.",
        isLoading: false,
      },
      {
        id: "estimatedTime",
        icon: Timer02Icon,
        title: "Tempo estimado",
        description: "Reserve cerca de 7 minutos.",
        isLoading: false,
      },
    ],
    isLoading: false,
    isJourneyNotFound: false,
    isExitModalOpen: false,
    journeysHref: "/jornadas",
    handleStart: vi.fn(),
    handleBack: vi.fn(),
    handleExit: vi.fn(),
    handleCancelExit: vi.fn(),
    handleConfirmExit: vi.fn(),
    ...overrides,
  };
}

function mockVM(overrides?: Partial<CompetenciesIntroViewModelReturn>) {
  const vm = createVM(overrides);
  vi.spyOn(viewModelModule, "useCompetenciesIntroVM").mockReturnValue(vm);
  return vm;
}

describe("CompetenciesIntroView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar cabeçalho, título, apresentação, as quatro instruções e a dica", () => {
    mockVM();
    render(<CompetenciesIntroView />);

    expect(screen.getByText("PRÉ-QUESTIONÁRIO · COMPETÊNCIAS")).toBeDefined();
    expect(
      screen
        .getByText("Encarregado pelo Tratamento de Dados Pessoais")
        .getAttribute("title"),
    ).toBe("Encarregado pelo Tratamento de Dados Pessoais");
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Questionário de competências",
      }),
    ).toBeDefined();
    expect(
      screen.getByText(
        "A seguir, você responderá perguntas sobre privacidade.",
      ),
    ).toBeDefined();

    const list = screen.getByRole("list", {
      name: "Instruções do questionário",
    });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(within(list).getByText("Reserve cerca de 7 minutos.")).toBeDefined();

    const tip = screen.getByRole("complementary");
    expect(tip.textContent).toBe(
      "Dica: ao concluir, você receberá um resultado detalhado.",
    );
  });

  it("deve exibir skeleton só na apresentação e no card de tempo durante o carregamento", () => {
    const vm = createVM();
    mockVM({
      isLoading: true,
      instructionItems: vm.instructionItems.map((item) =>
        item.id === "estimatedTime" ? { ...item, isLoading: true } : item,
      ),
    });
    render(<CompetenciesIntroView />);

    expect(
      screen
        .getByTestId("competencies-intro-text-skeleton")
        .getAttribute("aria-hidden"),
    ).toBe("true");
    expect(
      screen
        .getByTestId("instruction-estimatedTime-skeleton")
        .getAttribute("aria-hidden"),
    ).toBe("true");
    expect(
      screen.queryByText(
        "A seguir, você responderá perguntas sobre privacidade.",
      ),
    ).toBeNull();
    expect(screen.queryByText("Reserve cerca de 7 minutos.")).toBeNull();
    expect(screen.getByText("Questões objetivas")).toBeDefined();
    expect(screen.getByText("Carregando instruções...")).toBeDefined();
  });

  it("deve exibir o estado de jornada não encontrada", () => {
    mockVM({ isJourneyNotFound: true });
    render(<CompetenciesIntroView />);

    expect(screen.getByText("Nenhuma jornada em andamento")).toBeDefined();
    expect(
      screen
        .getByRole("link", { name: "Voltar para jornadas" })
        .getAttribute("href"),
    ).toBe("/jornadas");
    expect(screen.queryByText("Iniciar questionário")).toBeNull();
  });

  it("deve chamar os handlers de iniciar, voltar e sair", () => {
    const vm = mockVM();
    render(<CompetenciesIntroView />);

    fireEvent.click(
      screen.getByRole("button", { name: /Iniciar questionário/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para a etapa anterior" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Sair do pré-questionário" }),
    );

    expect(vm.handleStart).toHaveBeenCalledTimes(1);
    expect(vm.handleBack).toHaveBeenCalledTimes(1);
    expect(vm.handleExit).toHaveBeenCalledTimes(1);
  });

  it("deve exibir o modal de saída quando aberto", () => {
    mockVM({ isExitModalOpen: true });
    render(<CompetenciesIntroView />);

    expect(screen.getByText("Deseja sair do pré-questionário?")).toBeDefined();
  });
});
