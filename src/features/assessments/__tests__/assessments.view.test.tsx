// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AssessmentsView } from "../index";
import * as viewModelModule from "../assessments.viewmodel";
import type { AssessmentsViewModelReturn, AssessmentsLabels } from "../assessments.types";
import { AppProviders } from "@/shared/providers";

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
  usePathname: () => "/jornadas",
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

  function renderView() {
    return render(
      <AppProviders>
        <AssessmentsView />
      </AppProviders>
    );
  }

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
      pendingTotal: 1,
      pendingPage: 1,
      pendingTotalPages: 1,
      isPendingLoading: false,
      pendingError: null,
      isPendingSectionVisible: true,
      handlePendingPageChange: vi.fn(),
      handleRetryPending: vi.fn(),
      pendingPageError: null,
      dismissPendingPageError: vi.fn(),

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
      catalogError: null,
      searchTerm: "",
      handleSearchChange: vi.fn(),
      handleCatalogPageChange: vi.fn(),
      handleRetryCatalog: vi.fn(),
      catalogPageError: null,
      dismissCatalogPageError: vi.fn(),

      labels: mockLabels,
      ...overrides,
    };
  }

  it("deve renderizar o Accordion das jornadas pendentes e permitir alternar abertura/fechamento ao clicar no trigger", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn()
    );

    renderView();

    expect(screen.getByText("Jornadas pendentes")).toBeDefined();
    expect(screen.getByText("Segurança Digital Básica")).toBeDefined();

    const accordionTrigger = screen.getByTestId("accordion-trigger");
    expect(accordionTrigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(accordionTrigger);

    expect(accordionTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Segurança Digital Básica")).toBeNull();
  });

  it("deve exibir estado de erro na seção de pendentes dentro do Accordion sem ocultar o Accordion", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({
        isPendingSectionVisible: true,
        pendingJourneys: [],
        pendingError: "Falha ao carregar pendentes",
      })
    );

    renderView();

    expect(screen.getByText("Jornadas pendentes")).toBeDefined();
    expect(screen.getByTestId("pending-error-state")).toBeDefined();
    expect(screen.getByText("Falha ao carregar pendentes")).toBeDefined();
  });

  it("deve exibir estado de erro no catálogo em vez de EmptyState quando houver catalogError", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({
        catalogJourneys: [],
        catalogError: "Erro ao carregar catálogo",
      })
    );

    renderView();

    expect(screen.getByTestId("catalog-error-state")).toBeDefined();
    expect(screen.getByText("Erro ao carregar catálogo")).toBeDefined();
    expect(screen.queryByText("Nenhuma jornada encontrada para o termo buscado.")).toBeNull();
  });

  it("deve exibir EmptyState quando não houver erro e a busca não retornar resultados", () => {
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({
        catalogJourneys: [],
        catalogError: null,
      })
    );

    renderView();

    expect(screen.getByText("Nenhuma jornada encontrada para o termo buscado.")).toBeDefined();
  });

  it("deve renderizar a lista do catálogo e o input de busca pelo nome", () => {
    const handleSearchChangeMock = vi.fn();
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({ handleSearchChange: handleSearchChangeMock })
    );

    renderView();

    expect(screen.getByText("Todas as jornadas")).toBeDefined();
    expect(screen.getByText("LGPD para Desenvolvedores")).toBeDefined();

    const searchInput = screen.getByPlaceholderText(
      "Buscar jornada pelo nome..."
    );
    expect(searchInput).toBeDefined();

    fireEvent.change(searchInput, { target: { value: "LGPD" } });
    expect(handleSearchChangeMock).toHaveBeenCalledWith("LGPD");
  });

  it("deve exibir um toast pontual de erro ao trocar de página sem ocultar os cards já carregados", () => {
    const dismissPendingPageErrorMock = vi.fn();
    vi.spyOn(viewModelModule, "useAssessmentsVM").mockReturnValue(
      createMockVMReturn({
        pendingPageError: "Falha ao trocar de página",
        dismissPendingPageError: dismissPendingPageErrorMock,
      })
    );

    renderView();

    // Os cards da página atual continuam visíveis
    expect(screen.getByText("Segurança Digital Básica")).toBeDefined();
    // E o toast pontual aparece separadamente do estado de erro da seção
    expect(screen.getByText("Falha ao trocar de página")).toBeDefined();
    expect(screen.queryByTestId("pending-error-state")).toBeNull();
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

    renderView();

    const skeletons = screen.getAllByTestId("journey-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
