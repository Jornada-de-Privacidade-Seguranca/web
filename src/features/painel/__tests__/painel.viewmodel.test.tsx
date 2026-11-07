// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as dashboardService from "@services/dashboardService";
import { useAuthStore } from "@features/auth/auth.store";
import { usePainelVM } from "../painel.viewmodel";

vi.mock("@hooks/useAuth", () => ({
  useAuth: () => {
    const user = useAuthStore.getState().user;
    return {
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      setAuth: useAuthStore.getState().setAuth,
      clearAuth: useAuthStore.getState().clearAuth,
      logout: vi.fn(),
    };
  },
}));

vi.mock("next-intl", () => {
  const messages: Record<string, string> = {
    pageTitle: "Painel",
    welcomeGreeting: "Olá, {name}",
    welcomeSubtitle: "Acompanhe seu progresso, continue suas jornadas e veja seus indicadores de desempenho.",
    profileRoleFallback: "Colaborador",
    organizationLabel: "Organização: {organization}",
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
    progressLabel: "Progresso da jornada",
    progressPercentLabel: "{percent}% concluído",
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
  };

  const t = (key: string, params?: Record<string, unknown>) => {
    let text = messages[key] ?? key;
    for (const [name, value] of Object.entries(params ?? {})) {
      text = text.replace(`{${name}}`, String(value));
    }
    return text;
  };

  return { useTranslations: () => t, useLocale: () => "pt" };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("Painel ViewModel (usePainelVM)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: {
        id: 1,
        name: "Maria Oliveira Silva",
        email: "maria@empresa.com",
        role: "common_user",
        profile: {
          role: "common_user",
          label: "Usuário comum",
          user_type_id: 2,
          profile_type_id: 1,
          profile_type_name: "Analista de Privacidade",
        },
        organization: "Tribunal Regional Eleitoral",
        active_status: 1,
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("deve carregar dados do usuário e do painel com sucesso (caminho feliz)", async () => {
    const mockDashboardData = {
      pending: {
        id: "p1",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        description: "Avaliação em andamento",
        status: "in_progress" as const,
        totalQuestions: 15,
        estimatedMinutes: 20,
        progressPercent: 70,
        knowledgeDomain: "privacy" as const,
      },
      lastCompleted: {
        id: "c1",
        title: "Gestor de Segurança da Informação",
        completedAt: "2026-05-19T00:00:00Z",
        score: 95,
      },
      history: [
        {
          id: "h1",
          title: "Gestor de Segurança da Informação",
          completedAt: "2026-05-19T00:00:00Z",
          score: 95,
        },
      ],
      metrics: {
        completedJourneys: 4,
        pendingJourneys: 1,
        averageScore: 92,
      },
    };

    vi.spyOn(dashboardService, "getDashboardData").mockResolvedValueOnce(
      mockDashboardData
    );

    const { result } = renderHook(() => usePainelVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userFirstName).toBe("Maria");
    expect(result.current.userRoleName).toBe("Analista de Privacidade");
    expect(result.current.userOrganization).toBe("Tribunal Regional Eleitoral");
    expect(result.current.greetingTitle).toBe("Olá, Maria");
    expect(result.current.currentJourney?.title).toBe(
      "Encarregado pelo Tratamento de Dados Pessoais"
    );
    expect(result.current.metrics.completedJourneys).toBe(4);
    expect(result.current.metrics.averageScore).toBe(92);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.metricsItems).toHaveLength(3);

    // Quick actions com jornada em andamento deve apontar para competências
    expect(result.current.quickActions[0].id).toBe("continue-journey");
    expect(result.current.quickActions[0].href).toBe(
      "/jornada/atual/competencias/0"
    );
  });

  it("deve apontar para o resumo da jornada quando a jornada for atribuída mas não iniciada (status pending)", async () => {
    vi.spyOn(dashboardService, "getDashboardData").mockResolvedValueOnce({
      pending: {
        id: "p2",
        title: "Controlador",
        description: "Jornada atribuída",
        status: "pending",
        totalQuestions: 10,
        estimatedMinutes: 15,
      },
      lastCompleted: null,
      history: [],
      metrics: {
        completedJourneys: 0,
        pendingJourneys: 1,
        averageScore: 0,
      },
    });

    const { result } = renderHook(() => usePainelVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.quickActions[0].id).toBe("start-journey");
    expect(result.current.quickActions[0].href).toBe("/jornada/p2");
  });

  it("deve apresentar atalho de 'Iniciar jornada' quando não houver nenhuma jornada cadastrada", async () => {
    vi.spyOn(dashboardService, "getDashboardData").mockResolvedValueOnce({
      pending: null,
      lastCompleted: null,
      history: [],
      metrics: {
        completedJourneys: 0,
        pendingJourneys: 0,
        averageScore: 0,
      },
    });

    const { result } = renderHook(() => usePainelVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentJourney).toBeNull();
    expect(result.current.quickActions[0].id).toBe("start-journey");
    expect(result.current.quickActions[0].href).toBe("/jornadas");
  });

  it("deve usar o fallback de tradução quando o usuário não tiver nome", async () => {
    useAuthStore.setState({
      user: {
        id: 2,
        name: "",
        email: "anon@teste.com",
        role: "common_user",
        profile: {
          role: "common_user",
          label: "Colaborador",
          user_type_id: 1,
          profile_type_id: 1,
          profile_type_name: null,
        },
        active_status: 1,
      },
      isAuthenticated: true,
      isLoading: false,
    });

    vi.spyOn(dashboardService, "getDashboardData").mockResolvedValueOnce({
      pending: null,
      lastCompleted: null,
      history: [],
      metrics: { completedJourneys: 0, pendingJourneys: 0, averageScore: 0 },
    });

    const { result } = renderHook(() => usePainelVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userFirstName).toBe("Usuário");
    expect(result.current.greetingTitle).toBe("Olá, Usuário");
  });

  it("deve lidar com erros de backend e fornecer mensagem amigável de t(errorMessage)", async () => {
    vi.spyOn(dashboardService, "getDashboardData").mockRejectedValue(
      new Error("Falha no servidor interno (500)")
    );

    const { result } = renderHook(() => usePainelVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Não foi possível carregar os dados do painel.");
  });

  it("deve permitir retentativa chamando handleRetry", async () => {
    const spy = vi
      .spyOn(dashboardService, "getDashboardData")
      .mockRejectedValueOnce(new Error("Erro de rede"))
      .mockResolvedValueOnce({
        pending: null,
        lastCompleted: null,
        history: [],
        metrics: {
          completedJourneys: 1,
          pendingJourneys: 0,
          averageScore: 80,
        },
      });

    const { result } = renderHook(() => usePainelVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Não foi possível carregar os dados do painel.");
    });

    act(() => {
      result.current.handleRetry();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
