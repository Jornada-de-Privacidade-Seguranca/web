// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as journeySummaryService from "@services/journeySummaryService";
import type { JourneySummary } from "@services/journeySummaryService";
import { useCompetenciesIntroVM } from "../competenciesIntro.viewmodel";

const pushMock = vi.fn();
let mockContext: {
  journeyId: string | null;
  domain: "privacy" | "security" | "joint" | null;
  isLoading: boolean;
  isNotFound: boolean;
};

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@hooks/useJourneyContext", () => ({
  useJourneyContext: () => ({
    journeyId: mockContext.journeyId,
    profileId: mockContext.journeyId ? "1" : null,
    profileName: mockContext.journeyId ? "Encarregado de Dados" : null,
    domain: mockContext.domain,
    isLoading: mockContext.isLoading,
    isError: mockContext.isNotFound,
    isNotFound: mockContext.isNotFound,
    refetch: vi.fn(),
  }),
}));

vi.mock("next-intl", () => {
  const messages: Record<string, string> = {
    "intro.intro":
      "Perguntas sobre seus conhecimentos em {domain}.",
    "intro.domains.privacy": "privacidade",
    "intro.domains.security": "segurança da informação",
    "intro.domains.joint":
      "privacidade e/ou segurança da informação",
    "intro.items.estimatedTime.description":
      "Reserve cerca de {minutes} minutos.",
    "intro.items.estimatedTime.fallbackDescription":
      "Reserve um momento.",
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
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function summary(estimatedMinutes: number): JourneySummary {
  return { estimatedMinutes } as JourneySummary;
}

function estimatedTimeItem(result: {
  current: ReturnType<typeof useCompetenciesIntroVM>;
}) {
  return result.current.instructionItems.find(
    (item) => item.id === "estimatedTime",
  );
}

describe("useCompetenciesIntroVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    mockContext = {
      journeyId: "78",
      domain: "privacy",
      isLoading: false,
      isNotFound: false,
    };
  });

  it("deve montar o texto pelo domínio e o tempo pela duração do resumo da jornada em andamento", async () => {
    const spy = vi
      .spyOn(journeySummaryService, "getJourneySummary")
      .mockResolvedValue(summary(7));

    const { result } = renderHook(() => useCompetenciesIntroVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(spy).toHaveBeenCalledWith("78", "pt");
    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
    expect(result.current.labels.intro).toBe(
      "Perguntas sobre seus conhecimentos em privacidade.",
    );
    expect(result.current.instructionItems.map((item) => item.id)).toEqual([
      "objective",
      "sincerity",
      "navigation",
      "estimatedTime",
    ]);
    expect(estimatedTimeItem(result)).toMatchObject({
      description: "Reserve cerca de 7 minutos.",
      isLoading: false,
    });
  });

  it.each([
    ["security", "segurança da informação"],
    ["joint", "privacidade e/ou segurança da informação"],
    [null, "privacidade e/ou segurança da informação"],
  ] as const)("deve usar o texto do domínio %s", async (domain, text) => {
    mockContext.domain = domain;
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue(
      summary(5),
    );

    const { result } = renderHook(() => useCompetenciesIntroVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.labels.intro).toBe(
      `Perguntas sobre seus conhecimentos em ${text}.`,
    );
  });

  it("deve usar o texto sem tempo quando a duração não puder ser carregada", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockRejectedValue(
      new Error("falha"),
    );

    const { result } = renderHook(() => useCompetenciesIntroVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(estimatedTimeItem(result)).toMatchObject({
      description: "Reserve um momento.",
      isLoading: false,
    });
    expect(result.current.isJourneyNotFound).toBe(false);
  });

  it("deve indicar carregamento, sem buscar a duração, enquanto a jornada em andamento carrega", () => {
    mockContext = {
      journeyId: null,
      domain: null,
      isLoading: true,
      isNotFound: false,
    };
    const spy = vi.spyOn(journeySummaryService, "getJourneySummary");

    const { result } = renderHook(() => useCompetenciesIntroVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(estimatedTimeItem(result)?.isLoading).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("deve indicar ausência de jornada em andamento sem buscar a duração", () => {
    mockContext = {
      journeyId: null,
      domain: null,
      isLoading: false,
      isNotFound: true,
    };
    const spy = vi.spyOn(journeySummaryService, "getJourneySummary");

    const { result } = renderHook(() => useCompetenciesIntroVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isJourneyNotFound).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("deve navegar pela rota fixa: iniciar na área 0 e voltar para o resumo da jornada", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue(
      summary(5),
    );
    const { result } = renderHook(() => useCompetenciesIntroVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.handleStart());
    expect(pushMock).toHaveBeenLastCalledWith("/jornada/atual/competencias/0");

    act(() => result.current.handleBack());
    expect(pushMock).toHaveBeenLastCalledWith("/jornada/78");
  });

  it("deve abrir o modal ao sair, fechar ao cancelar e ir para /jornadas ao confirmar", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue(
      summary(5),
    );
    const { result } = renderHook(() => useCompetenciesIntroVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.handleExit());
    expect(result.current.isExitModalOpen).toBe(true);
    act(() => result.current.handleCancelExit());
    expect(result.current.isExitModalOpen).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();

    act(() => result.current.handleExit());
    act(() => result.current.handleConfirmExit());
    expect(result.current.isExitModalOpen).toBe(false);
    expect(pushMock).toHaveBeenCalledWith("/jornadas");
  });
});
