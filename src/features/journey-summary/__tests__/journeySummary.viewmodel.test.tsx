// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import * as journeySummaryService from "@services/journeySummaryService";
import { JourneySummaryRequestError } from "@services/journeySummaryService";
import { useJourneySummaryVM } from "../journeySummary.viewmodel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { JourneySummary } from "../journeySummary.types";

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock("next-intl", () => ({
  useLocale: () => "pt",
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) => {
      if (key === "stepsCountAriaLabel") return `${params?.count} etapas`;
      if (key === "durationAriaLabel") return `${params?.minutes} minutos de duração`;
      if (key === "areasAriaLabel") return `${params?.count} áreas`;
      if (key === "competenciesAriaLabel") return `${params?.count} competências`;
      if (key === "estimatedMinutesText") return `${params?.minutes} min`;
      return key;
    };
    t.raw = (key: string) => {
      if (key === "steps") {
        return [{ title: "Etapa 1", description: "Descrição 1" }];
      }
      return key;
    };
    return t;
  },
}));

let mockPathname = "/jornada/1";

vi.mock("@/shared/i18n/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: pushMock,
    back: backMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@shared/i18n/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: pushMock,
    back: backMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe("useJourneySummaryVM", () => {
  const notStartedJourney: JourneySummary = {
    id: "1",
    title: "Governança de Dados",
    stepsCount: 6,
    completedStepsCount: 0,
    estimatedMinutes: 23,
    areasCount: 13,
    competenciesCount: 39,
    status: "not_started",
    progress: { firstStepSlug: "experiencia-profissional", lastAnsweredStepSlug: null },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    backMock.mockReset();
    mockPathname = "/jornada/1";
  });

  it("deve carregar a jornada e derivar rótulo/rota do CTA para status not_started", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue(
      notStartedJourney
    );

    const { result } = renderHook(() => useJourneySummaryVM("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.journey?.title).toBe("Governança de Dados");
    expect(result.current.ctaLabel).toBe("actionStart");
    expect(result.current.resolvedStartUrl).toBe(
      "/jornada/1/experiencia-profissional"
    );
    expect(result.current.error).toBeNull();
  });

  it("deve retomar a partir da última etapa respondida quando status for in_progress", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue({
      ...notStartedJourney,
      status: "in_progress",
      progress: {
        firstStepSlug: "experiencia-profissional",
        lastAnsweredStepSlug: "formacao-academica",
      },
    });

    const { result } = renderHook(() => useJourneySummaryVM("2"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.ctaLabel).toBe("actionContinue");
    expect(result.current.resolvedStartUrl).toBe(
      "/jornada/1/formacao-academica"
    );
  });

  it("deve cair na primeira etapa quando in_progress não tiver nenhuma resposta salva", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue({
      ...notStartedJourney,
      status: "in_progress",
      progress: { firstStepSlug: "experiencia-profissional", lastAnsweredStepSlug: null },
    });

    const { result } = renderHook(() => useJourneySummaryVM("2"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.resolvedStartUrl).toBe(
      "/jornada/1/experiencia-profissional"
    );
  });

  it("deve usar o rótulo de refazer e a primeira etapa quando status for completed", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue({
      ...notStartedJourney,
      status: "completed",
      progress: {
        firstStepSlug: "experiencia-profissional",
        lastAnsweredStepSlug: "competencias",
      },
    });

    const { result } = renderHook(() => useJourneySummaryVM("3"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.ctaLabel).toBe("actionRetake");
    expect(result.current.resolvedStartUrl).toBe(
      "/jornada/1/experiencia-profissional"
    );
  });

  it("deve expor error 'not_found' quando o serviço rejeitar com JourneySummaryRequestError do tipo not_found", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockRejectedValue(
      new JourneySummaryRequestError("not_found", "Jornada não encontrada.")
    );

    const { result } = renderHook(() => useJourneySummaryVM("999"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("not_found");
    expect(result.current.journey).toBeNull();
  });

  it("deve expor error 'server_error' para falhas genéricas", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockRejectedValue(
      new JourneySummaryRequestError("server_error", "Falha ao carregar.")
    );

    const { result } = renderHook(() => useJourneySummaryVM("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("server_error");
  });

  it("onStartJourney deve navegar para resolvedStartUrl e onDismiss deve voltar no histórico", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue(
      notStartedJourney
    );

    const { result } = renderHook(() => useJourneySummaryVM("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.onStartJourney();
    expect(pushMock).toHaveBeenCalledWith("/jornada/1/experiencia-profissional");

    result.current.onDismiss();
    expect(backMock).toHaveBeenCalled();
  });

  it("deve respeitar o prefixo /journey ao resolver a URL de início", async () => {
    mockPathname = "/journey/1";
    vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue(
      notStartedJourney
    );

    const { result } = renderHook(() => useJourneySummaryVM("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.resolvedStartUrl).toBe(
      "/journey/1/experiencia-profissional"
    );
  });
});
