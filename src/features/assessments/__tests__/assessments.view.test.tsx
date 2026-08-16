// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AssessmentsView } from "../index";
import * as viewModelModule from "../assessments.viewmodel";
import type { AssessmentsViewModelReturn, AssessmentsLabels } from "../assessments.types";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "pt" }),
}));

// Mock i18n navigation helpers
vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/assessments",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("AssessmentsView Component", () => {
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

  const mockLabels: AssessmentsLabels = {
    title: "Jornadas de Aprendizado",
    subtitle: "Acesse suas trilhas de conhecimento e avaliações",
    pendingSectionTitle: "Jornadas pendentes",
    pendingSectionSubtitle: "Jornadas disponíveis para você responder.",
    pendingEmpty: "Você não possui jornadas pendentes no momento.",
    catalogSectionTitle: "Todas as jornadas",
    catalogSectionSubtitle: "Escolha qualquer jornada disponível para responder.",
    catalogSearchPlaceholder: "Buscar jornada pelo nome...",
    catalogEmpty: "Nenhuma jornada encontrada para o termo buscado.",
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
    paginationPageOf: (current: number, total: number) =>
      `Página ${current} de ${total}`,
    errorTitle: "Erro ao carregar jornadas",
    errorMessage: "Não foi possível carregar as jornadas.",
    retryButton: "Tentar novamente",
    loadingAriaLabel: "Carregando listagem de jornadas",
  };

  function createMockVMReturn(
    overrides?: Partial<AssessmentsViewModelReturn>
  ): AssessmentsViewModelReturn {
    return {
      pendingJourneys: [
        {
          id: "p1",
          title: "Segurança Digital Básica",
          description: "Conceitos fundamentais de segurança",
          totalQuestions: 10,
          estimatedMinutes: 15,
          status: "in_progress",
        },
      ],
      pendingPage: 1,
      pendingTotalPages: 1,
      isPendingLoading: false,
      handlePendingPageChange: vi.fn(),

      catalogJourneys: [
        {
          id: "c1",
          title: "LGPD para Desenvolvedores",
          description: "Privacidade e proteção de dados no código",
          totalQuestions: 8,
          estimatedMinutes: 12,
          status: "completed",
        },
      ],
      catalogPage: 1,
      catalogTotalPages: 1,
      isCatalogLoading: false,
      searchTerm: "",
      handleSearchChange: vi.fn(),
      handleCatalogPageChange: vi.fn(),

      isLoading: false,
      error: null,
      serverMessage: null,
      onCloseMsg: vi.fn(),
      handleRetry: vi.fn(),
      labels: mockLabels,
      ...overrides,
    };
  }

  it("deve renderizar o Accordion das jornadas pendentes (aberto por padrão)", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn()
    );

    render(<AssessmentsView />);

    expect(screen.getByText("Jornadas pendentes")).toBeDefined();
    expect(screen.getByText("Segurança Digital Básica")).toBeDefined();

    const accordionTrigger = screen.getByTestId("accordion-trigger");
    expect(accordionTrigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("deve renderizar a lista do catálogo e o input de busca pelo nome", () => {
    const handleSearchChangeMock = vi.fn();
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({ handleSearchChange: handleSearchChangeMock })
    );

    render(<AssessmentsView />);

    expect(screen.getByText("Todas as jornadas")).toBeDefined();
    expect(screen.getByText("LGPD para Desenvolvedores")).toBeDefined();

    const searchInput = screen.getByPlaceholderText(
      "Buscar jornada pelo nome..."
    );
    expect(searchInput).toBeDefined();

    fireEvent.change(searchInput, { target: { value: "LGPD" } });
    expect(handleSearchChangeMock).toHaveBeenCalledWith("LGPD");
  });

  it("deve exibir o Skeleton de loading quando a lista estiver carregando", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({
        isPendingLoading: true,
        isCatalogLoading: true,
        pendingJourneys: [],
        catalogJourneys: [],
      })
    );

    render(<AssessmentsView />);

    const skeletons = screen.getAllByTestId("journey-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("deve exibir a Tag 'Concluída' em um card mockado com status concluído", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({
        catalogJourneys: [
          {
            id: "c1",
            title: "Segurança de Dados Avançada",
            description: "Proteção contra vazamento de dados",
            totalQuestions: 15,
            estimatedMinutes: 20,
            status: "completed",
          },
        ],
      })
    );

    render(<AssessmentsView />);

    const completedTag = screen.getByTestId("status-completed-tag");
    expect(completedTag).toBeDefined();
    expect(completedTag.textContent).toContain("Concluída");
  });

  it("deve exibir alerta do servidor quando serverMessage for fornecido", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({
        serverMessage: {
          title: "Erro ao carregar jornadas",
          description: "Falha de conexão com o servidor",
          variant: "destructive",
        },
      })
    );

    render(<AssessmentsView />);

    expect(screen.getByText("Erro ao carregar jornadas")).toBeDefined();
    expect(screen.getByText("Falha de conexão com o servidor")).toBeDefined();
  });
});
