// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PainelView } from "../index";
import * as viewModelModule from "../painel.viewmodel";
import type { PainelViewModelReturn } from "../painel.types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: () => "10/06/2026",
  }),
}));

vi.mock("@/components/layout/PageShell", () => ({
  PageShell: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="page-shell">
      <div data-testid="page-title">{title}</div>
      <main>{children}</main>
    </div>
  ),
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockBaseReturn: PainelViewModelReturn = {
  userFirstName: "Carlos",
  userRoleName: "Especialista em Segurança",
  userOrganization: "Empresa XPTO",
  greetingTitle: "Olá, Carlos",
  greetingSubtitle: "Acompanhe seu progresso e métricas de desempenho.",
  currentJourney: {
    id: "j1",
    title: "Trilha de Segurança da Informação",
    description: "Avaliação de competências em segurança e controles.",
    status: "in_progress",
    totalQuestions: 20,
    estimatedMinutes: 25,
    currentStep: "competencias",
    progressPercent: 60,
    knowledgeDomain: "security",
  },
  lastCompletedAssessment: {
    id: "c1",
    title: "LGPD Básico",
    completedAt: "2026-06-10T12:00:00Z",
    score: 85,
  },
  history: [
    {
      id: "h1",
      title: "LGPD Básico",
      completedAt: "2026-06-10T12:00:00Z",
      score: 85,
    },
  ],
  metrics: {
    completedJourneys: 2,
    pendingJourneys: 1,
    averageScore: 85,
  },
  quickActions: [
    {
      id: "continue-journey",
      label: "Continuar jornada",
      description: "Retome sua trilha de onde parou",
      href: "/jornada/atual/competencias",
      iconName: "play",
    },
    {
      id: "view-results",
      label: "Meus resultados",
      description: "Veja diagnósticos e notas obtidas",
      href: "/resultados",
      iconName: "award",
    },
    {
      id: "view-profile",
      label: "Meu perfil",
      description: "Gerencie seus dados e preferências",
      href: "/perfil",
      iconName: "user",
    },
  ],
  isLoading: false,
  error: null,
  handleRetry: vi.fn(),
  labels: {
    pageTitle: "Painel",
    welcomeGreeting: "Olá, Carlos",
    welcomeSubtitle: "Acompanhe seu progresso e métricas de desempenho.",
    profileRoleFallback: "Colaborador",
    organizationLabel: "Organização: Empresa XPTO",
    greetingSubtitle: "Pronto para sua próxima avaliação?",
    quickActionsTitle: "Atalhos rápidos",
    quickActionsSectionAriaLabel: "Ações e atalhos rápidos",
    quickActionContinueJourney: "Continuar jornada",
    quickActionContinueJourneyDesc: "Retome sua trilha de onde parou",
    quickActionStartJourney: "Iniciar jornada",
    quickActionStartJourneyDesc: "Escolha uma trilha de aprendizagem",
    quickActionViewResults: "Meus resultados",
    quickActionViewResultsDesc: "Veja diagnósticos e notas obtidas",
    quickActionViewProfile: "Meu perfil",
    quickActionViewProfileDesc: "Gerencie seus dados e preferências",
    currentJourneySectionTitle: "Jornada em andamento",
    currentJourneySectionAriaLabel: "Jornada em andamento",
    currentJourneyEmpty: "Você não possui nenhuma jornada em andamento.",
    startNewJourneyCta: "Explorar jornadas",
    continueJourneyCta: "Continuar de onde parou",
    progressLabel: "Progresso da jornada",
    progressPercentLabel: "{percent}% concluído",
    metricsSectionTitle: "Indicadores de desempenho",
    metricsSectionAriaLabel: "Métricas e indicadores de desempenho",
    metricsCompletedTitle: "Jornadas concluídas",
    metricsCompletedSubtitle: "Trilhas finalizadas com sucesso",
    metricsPendingTitle: "Jornadas em andamento",
    metricsPendingSubtitle: "Trilhas aguardando conclusão",
    metricsAverageScoreTitle: "Média de desempenho",
    metricsAverageScoreSubtitle: "Pontuação média geral",
    pendingSectionTitle: "Avaliação em destaque",
    completedSectionTitle: "Última conclusão",
    historySectionTitle: "Histórico recente",
    pendingEmpty: "Nenhuma avaliação pendente no momento.",
    completedEmpty: "Você ainda não possui avaliações concluídas.",
    historyEmpty: "Nenhum histórico de avaliações disponível.",
    badgePending: "AVALIAÇÃO PENDENTE",
    badgeInProgress: "EM ANDAMENTO",
    startAssessment: "Iniciar avaliação",
    continueAssessment: "Continuar avaliação",
    lastCompletionLabel: "ÚLTIMA CONCLUSÃO",
    scoreLabel: "PONTUAÇÃO",
    viewResult: "Ver resultado",
    errorTitle: "Falha ao carregar informações",
    errorMessage: "Não foi possível carregar os dados do painel.",
    retryButton: "Tentar novamente",
    loadingAriaLabel: "Carregando dados do painel",
    pendingSectionAriaLabel: "Avaliação pendente ou em andamento",
    completedSectionAriaLabel: "Última avaliação concluída",
    historySectionAriaLabel: "Histórico recente de avaliações",
  },
};

describe("PainelView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar o cabeçalho de boas-vindas com título hierárquico, cargo e organização", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue(mockBaseReturn);

    render(<PainelView />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Olá, Carlos");
    expect(screen.getByText("Especialista em Segurança")).toBeDefined();
    expect(screen.getByText("Organização: Empresa XPTO")).toBeDefined();
  });

  it("deve renderizar os atalhos rápidos com links funcionais", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue(mockBaseReturn);

    render(<PainelView />);

    const continueLink = screen.getByRole("link", {
      name: /Continuar jornada/i,
    });
    expect(continueLink.getAttribute("href")).toBe(
      "/jornada/atual/competencias"
    );

    const resultsLink = screen.getByRole("link", { name: /Meus resultados/i });
    expect(resultsLink.getAttribute("href")).toBe("/resultados");

    const profileLink = screen.getByRole("link", { name: /Meu perfil/i });
    expect(profileLink.getAttribute("href")).toBe("/perfil");
  });

  it("deve renderizar a barra de progresso com atributos de acessibilidade ARIA", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue(mockBaseReturn);

    render(<PainelView />);

    const progressbars = screen.getAllByRole("progressbar");
    expect(progressbars.length).toBeGreaterThan(0);

    const mainProgress = progressbars[0];
    expect(mainProgress.getAttribute("aria-valuenow")).toBe("60");
    expect(mainProgress.getAttribute("aria-valuemin")).toBe("0");
    expect(mainProgress.getAttribute("aria-valuemax")).toBe("100");
  });

  it("deve renderizar o estado de carregamento com skeleton e aria-busy='true'", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      isLoading: true,
    });

    render(<PainelView />);

    const skeletonContainer = screen.getByLabelText(
      "Carregando dados do painel"
    );
    expect(skeletonContainer).toBeDefined();
    expect(skeletonContainer.getAttribute("aria-busy")).toBe("true");
  });

  it("deve renderizar alerta de erro com papel alert e botão de tentar novamente", () => {
    const handleRetryMock = vi.fn();

    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      error: "Erro 500 no servidor",
      handleRetry: handleRetryMock,
    });

    render(<PainelView />);

    const alertSection = screen.getByRole("alert");
    expect(alertSection).toBeDefined();
    expect(alertSection.textContent).toContain("Erro 500 no servidor");

    const retryBtn = screen.getByRole("button", { name: /Tentar novamente/i });
    fireEvent.click(retryBtn);

    expect(handleRetryMock).toHaveBeenCalledTimes(1);
  });

  it("deve exibir EmptyState quando não houver jornada em andamento", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      currentJourney: null,
    });

    render(<PainelView />);

    expect(
      screen.getByText("Você não possui nenhuma jornada em andamento.")
    ).toBeDefined();
    const exploreLink = screen.getByRole("link", { name: /Explorar jornadas/i });
    expect(exploreLink.getAttribute("href")).toBe("/jornadas");
  });
});
