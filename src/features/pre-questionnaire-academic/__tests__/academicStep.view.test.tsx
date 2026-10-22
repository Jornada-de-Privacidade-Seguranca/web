// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AcademicStepView } from "../index";
import * as viewModelModule from "../academicStep.viewmodel";
import type { AcademicStepViewModelReturn } from "../academicStep.types";

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  Link: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function createVM(overrides?: Partial<AcademicStepViewModelReturn>): AcademicStepViewModelReturn {
  return {
    journeyTitle: "Encarregado de Dados",
    groups: [{ id: "1", label: "Graduação (Bacharelado/Licenciatura/Tecnólogo)" }],
    activeGroupId: "1",
    visibleCourses: [{ id: "11", label: "Direito", groupId: "1" }],
    selectedCourses: [],
    searchTerm: "",
    isLoading: false,
    isSubmitting: false,
    isContinueDisabled: false,
    error: null,
    isJourneyNotFound: false,
    isExitModalOpen: false,
    journeysHref: "/jornadas",
    labels: {
      stepTag: "PRÉ-QUESTIONÁRIO · FORMAÇÃO ACADÊMICA",
      title: "Formação acadêmica",
      description: "Selecione um ou mais cursos que fazem parte do seu currículo.",
      searchPlaceholder: "Pesquisar curso...",
      searchAriaLabel: "Pesquisar curso",
      groupsAriaLabel: "Níveis de formação",
      emptyLabel: "Nenhum curso encontrado.",
      counterLabel: "0 curso(s) selecionado(s)",
      removeCourseAriaLabel: (course) => `Remover ${course}`,
      backLabel: "Voltar",
      backAriaLabel: "Voltar para a etapa anterior",
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
      retryButton: "Tentar novamente",
      noOngoingJourneyTitle: "Nenhuma jornada em andamento",
      noOngoingJourneyMessage: "Não encontramos uma jornada em andamento.",
      backToJourneysLink: "Voltar para jornadas",
    },
    handleSearchChange: vi.fn(),
    handleGroupChange: vi.fn(),
    handleToggleCourse: vi.fn(),
    handleRemoveCourse: vi.fn(),
    handleContinue: vi.fn(),
    handleBack: vi.fn(),
    handleExit: vi.fn(),
    handleCancelExit: vi.fn(),
    handleConfirmExit: vi.fn(),
    handleRetry: vi.fn(),
    ...overrides,
  };
}

describe("AcademicStepView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it("deve exibir o skeleton durante o carregamento", () => {
    vi.spyOn(viewModelModule, "useAcademicStepVM").mockReturnValue(createVM({ isLoading: true }));
    render(<AcademicStepView />);

    expect(screen.getByTestId("academic-step-skeleton")).toBeDefined();
  });

  it("deve exibir o estado de jornada não encontrada com link para /jornadas", () => {
    vi.spyOn(viewModelModule, "useAcademicStepVM").mockReturnValue(
      createVM({ isJourneyNotFound: true })
    );
    render(<AcademicStepView />);

    expect(screen.getByText("Nenhuma jornada em andamento")).toBeDefined();
    expect(screen.getByText("Voltar para jornadas").closest("a")?.getAttribute("href")).toBe(
      "/jornadas"
    );
    expect(screen.queryByText("Formação acadêmica")).toBeNull();
  });

  it("deve renderizar a etapa com cabeçalho, abas, cursos e banner de erro", () => {
    vi.spyOn(viewModelModule, "useAcademicStepVM").mockReturnValue(
      createVM({ error: "Falha ao carregar." })
    );
    render(<AcademicStepView />);

    expect(screen.getByText("PRÉ-QUESTIONÁRIO · FORMAÇÃO ACADÊMICA")).toBeDefined();
    expect(screen.getByText("Encarregado de Dados")).toBeDefined();
    expect(screen.getByRole("tab", { name: /Graduação/ })).toBeDefined();
    expect(screen.getByRole("checkbox", { name: /Direito/ })).toBeDefined();
    expect(screen.getByRole("alert").textContent).toContain("Falha ao carregar.");
  });
});
