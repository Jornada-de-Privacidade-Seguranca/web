// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { PainelView } from "../index";
import * as viewModelModule from "../painel.viewmodel";
import type { PainelViewModelReturn } from "../painel.types";

vi.mock("next-intl", () => {
  const messages: Record<string, string> = {
    viewResult: "Ver resultado",
    viewAllResults: "Ver todos os resultados",
    completedSectionTitle: "Última conclusão",
    lastCompletionLabel: "ÚLTIMA CONCLUSÃO",
    scoreLabel: "PONTUAÇÃO",
    currentJourneySectionTitle: "Jornada em andamento",
    metricsSectionTitle: "Indicadores de desempenho",
    historySectionTitle: "Histórico recente",
  };

  return {
    useTranslations: () => (key: string) => messages[key] ?? key,
    useFormatter: () => ({
      dateTime: () => "10 de junho de 2026",
    }),
  };
});

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
    title: "Encarregado pelo Tratamento de Dados Pessoais",
    description: "Avaliação de competências em conformidade com a LGPD.",
    status: "in_progress",
    totalQuestions: 20,
    estimatedMinutes: 7,
  },
  currentJourneyQuestionsText: "20 perguntas",
  currentJourneyTimeText: "7 min",
  lastCompletedAssessment: {
    id: "c1",
    title: "Gestor de Segurança da Informação",
    completedAt: "2026-06-10T12:00:00Z",
    score: 85,
  },
  history: [
    {
      id: "h1",
      title: "Gestor de Segurança da Informação",
      completedAt: "2026-06-10T12:00:00Z",
      score: 85,
    },
  ],
  metricsItems: [
    {
      id: "completed-journeys",
      label: "Jornadas concluídas",
      value: 2,
      subtitle: "Jornadas finalizadas com sucesso",
    },
    {
      id: "pending-journeys",
      label: "Jornadas em andamento",
      value: 1,
      subtitle: "Jornadas aguardando conclusão",
    },
    {
      id: "average-score",
      label: "Média de desempenho",
      value: 85,
      suffix: "/ 100",
      subtitle: "Pontuação média geral",
    },
  ],
  hasMetrics: true,
  quickActions: [
    {
      id: "continue-journey",
      label: "Continuar jornada",
      description: "Retome sua jornada de onde parou",
      href: "/jornada/atual/competencias/0",
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
  canRetry: true,
  handleRetry: vi.fn(),
  labels: {
    pageTitle: "Painel",
    welcomeGreeting: "Olá, Carlos",
    welcomeSubtitle: "Acompanhe seu progresso e métricas de desempenho.",
    profileRoleFallback: "Colaborador",
    organizationLabel: "Organização: Empresa XPTO",
    greetingSubtitle: "Pronto para sua próxima jornada?",
    quickActionsTitle: "Atalhos rápidos",
    quickActionsSectionAriaLabel: "Ações e atalhos rápidos",
    quickActionContinueJourney: "Continuar jornada",
    quickActionContinueJourneyDesc: "Retome sua jornada de onde parou",
    quickActionStartJourney: "Iniciar jornada",
    quickActionStartJourneyDesc: "Escolha uma jornada de aprendizagem",
    quickActionViewResults: "Meus resultados",
    quickActionViewResultsDesc: "Veja diagnósticos e notas obtidas",
    quickActionViewProfile: "Meu perfil",
    quickActionViewProfileDesc: "Gerencie seus dados e preferências",
    currentJourneySectionTitle: "Jornada em andamento",
    currentJourneySectionAriaLabel: "Jornada em andamento",
    currentJourneyEmpty: "Você não possui nenhuma jornada em andamento no momento.",
    startFirstJourneyCta: "Inicie sua primeira jornada",
    startNewJourneyCta: "Explorar jornadas",
    continueJourneyCta: "Continuar de onde parou",
    metricsSectionTitle: "Indicadores de desempenho",
    metricsSectionAriaLabel: "Métricas e indicadores de desempenho",
    metricsCompletedTitle: "Jornadas concluídas",
    metricsCompletedSubtitle: "Jornadas finalizadas com sucesso",
    metricsPendingTitle: "Jornadas em andamento",
    metricsPendingSubtitle: "Jornadas aguardando conclusão",
    metricsAverageScoreTitle: "Média de desempenho",
    metricsAverageScoreSubtitle: "Pontuação média geral",
    pendingSectionTitle: "Jornada em destaque",
    completedSectionTitle: "Última conclusão",
    historySectionTitle: "Histórico recente",
    pendingEmpty: "Nenhuma jornada pendente no momento.",
    completedEmpty: "Você ainda não possui jornadas concluídas.",
    historyEmpty: "Nenhum histórico de jornadas disponível.",
    badgePending: "JORNADA PENDENTE",
    badgeInProgress: "EM ANDAMENTO",
    startAssessment: "Iniciar jornada",
    continueAssessment: "Continuar jornada",
    lastCompletionLabel: "ÚLTIMA CONCLUSÃO",
    scoreLabel: "PONTUAÇÃO",
    viewResult: "Ver resultado",
    viewAllResults: "Ver todos os resultados",
    defaultUserName: "Usuário",
    errorTitle: "Falha ao carregar informações",
    errorMessage: "Não foi possível carregar os dados do painel.",
    retryButton: "Tentar novamente",
    loadingAriaLabel: "Carregando dados do painel",
    pendingSectionAriaLabel: "Jornada pendente ou em andamento",
    completedSectionAriaLabel: "Última jornada concluída",
    historySectionAriaLabel: "Histórico recente de jornadas",
    accessDeniedTitle: "Acesso negado",
    accessDeniedMessage: "Você não tem permissão para acessar esta área.",
  },
  accessDeniedMessage: null,
  handleDismissAccessDenied: vi.fn(),
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

    const continueLinks = screen.getAllByRole("link", {
      name: /Continuar jornada/i,
    });
    expect(continueLinks[0].getAttribute("href")).toBe(
      "/jornada/atual/competencias/0"
    );

    const resultsLink = screen.getByRole("link", { name: /Meus resultados/i });
    expect(resultsLink.getAttribute("href")).toBe("/resultados");

    const profileLink = screen.getByRole("link", { name: /Meu perfil/i });
    expect(profileLink.getAttribute("href")).toBe("/perfil");
  });

  it("deve renderizar o botão 'Ver todos os resultados' ao lado de 'Ver resultado' no card de última conclusão", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue(mockBaseReturn);

    render(<PainelView />);

    const lastCompletedCard = screen.getByLabelText("Última jornada concluída");
    const viewResultLink = within(lastCompletedCard).getByRole("link", { name: /Ver resultado/i });
    expect(viewResultLink.getAttribute("href")).toBe("/jornada/c1/resultado");

    const viewAllLink = screen.getByRole("link", { name: /Ver todos os resultados/i });
    expect(viewAllLink.getAttribute("href")).toBe("/resultados");
  });

  it("deve mostrar perguntas, tempo e 'Continuar jornada' na jornada já iniciada", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue(mockBaseReturn);

    render(<PainelView />);

    const card = screen.getByLabelText("Jornada em andamento");
    expect(within(card).getByText("20 perguntas")).toBeDefined();
    expect(within(card).getByText("7 min")).toBeDefined();
    const action = within(card).getByRole("link", { name: /Continuar jornada/i });
    expect(action.getAttribute("href")).toBe("/jornada/atual/competencias/0");
  });

  it("deve mostrar 'Iniciar jornada' levando ao resumo na jornada não iniciada", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      currentJourney: { ...mockBaseReturn.currentJourney!, status: "pending" },
    });

    render(<PainelView />);

    const card = screen.getByLabelText("Jornada em andamento");
    const action = within(card).getByRole("link", { name: /Iniciar jornada/i });
    expect(action.getAttribute("href")).toBe("/jornada/j1");
    expect(within(card).queryByRole("link", { name: /Continuar jornada/i })).toBeNull();
  });

  it("deve ocultar perguntas e tempo quando não houver o dado", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      currentJourneyQuestionsText: null,
      currentJourneyTimeText: null,
    });

    render(<PainelView />);

    expect(screen.queryByText("20 perguntas")).toBeNull();
    expect(screen.queryByText("7 min")).toBeNull();
  });

  it("deve mostrar nota, barra e 'Ver resultado' em cada item do histórico", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue(mockBaseReturn);

    render(<PainelView />);

    const historySection = screen.getByLabelText("Histórico recente de jornadas");
    expect(within(historySection).getByText("85 / 100")).toBeDefined();
    const bar = within(historySection).getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("85");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    const link = within(historySection).getByRole("link", { name: /Ver resultado/i });
    expect(link.getAttribute("href")).toBe("/jornada/h1/resultado");
  });

  it("deve ocultar nota e barra quando a jornada não tiver nota", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      lastCompletedAssessment: { ...mockBaseReturn.lastCompletedAssessment!, score: null },
      history: [{ ...mockBaseReturn.history[0], score: null }],
    });

    render(<PainelView />);

    expect(screen.queryByText("PONTUAÇÃO")).toBeNull();
    expect(screen.queryByText("85 / 100")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    const historySection = screen.getByLabelText("Histórico recente de jornadas");
    expect(within(historySection).getByRole("link", { name: /Ver resultado/i })).toBeDefined();
  });

  it("deve ocultar a seção de métricas quando elas não estiverem disponíveis", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      hasMetrics: false,
      metricsItems: [],
    });

    render(<PainelView />);

    expect(screen.queryByText("Indicadores de desempenho")).toBeNull();
    expect(screen.getByLabelText("Última jornada concluída")).toBeDefined();
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

  it("deve mostrar a mensagem sem botão de nova tentativa quando ela não resolver", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      error: "Sua conta ainda não foi ativada.",
      canRetry: false,
    });

    render(<PainelView />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Sua conta ainda não foi ativada."
    );
    expect(screen.queryByRole("button", { name: /Tentar novamente/i })).toBeNull();
  });

  it("deve exibir os 3 estados vazios corretamente (jornada pendente com estilo tracejado e CTA de primeira jornada, última conclusão e histórico)", () => {
    vi.spyOn(viewModelModule, "usePainelVM").mockReturnValue({
      ...mockBaseReturn,
      currentJourney: null,
      lastCompletedAssessment: null,
      history: [],
    });

    render(<PainelView />);

    // 1. Estado vazio da jornada pendente
    expect(
      screen.getByText("Você não possui nenhuma jornada em andamento no momento.")
    ).toBeDefined();
    const startFirstLink = screen.getByRole("link", { name: /Inicie sua primeira jornada/i });
    expect(startFirstLink.getAttribute("href")).toBe("/jornadas");

    // 2. Estado vazio da última conclusão com botão 'Ver todos os resultados'
    expect(
      screen.getByText("Você ainda não possui jornadas concluídas.")
    ).toBeDefined();
    const viewAllInEmpty = screen.getByRole("link", { name: /Ver todos os resultados/i });
    expect(viewAllInEmpty.getAttribute("href")).toBe("/resultados");

    // 3. Estado vazio do histórico recente
    expect(
      screen.getByText("Nenhum histórico de jornadas disponível.")
    ).toBeDefined();
  });
});
