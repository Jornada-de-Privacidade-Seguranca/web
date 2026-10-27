// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as journeyResultService from "@services/journeyResultService";
import { JourneyResultRequestError } from "@services/journeyResultService";
import { useJourneyResultVM } from "../journeyResult.viewmodel";
import { buildJourney } from "./journeyResult.fixtures";

let mockLocale = "pt";

// Devolve a chave com os parâmetros, para conferir o que a ViewModel envia
vi.mock("next-intl", () => ({
  useLocale: () => mockLocale,
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key} ${JSON.stringify(params)}` : key,
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

function renderVM(journeyId = "10") {
  return renderHook(() => useJourneyResultVM(journeyId), { wrapper: createWrapper() });
}

describe("useJourneyResultVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockLocale = "pt";
  });

  it("deve buscar a jornada da rota e expor o resultado", async () => {
    const spy = vi
      .spyOn(journeyResultService, "getJourneyResult")
      .mockResolvedValue(buildJourney());

    const { result } = renderVM("10");

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(spy).toHaveBeenCalledWith("10");
    expect(result.current.error).toBeNull();
    expect(result.current.labels.errors).toBeNull();
    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
    expect(result.current.score).toEqual({ value: 76, band: "strong", bandLabel: "bands.strong" });
    expect(result.current.declaredCount).toBe(2);
    expect(result.current.totalCompetencies).toBe(4);
    expect(result.current.isJointJourney).toBe(true);
    expect(result.current.areaScoreGroups).toHaveLength(2);
    expect(result.current.categoryScores).toBeNull();
    expect(result.current.retakeUrl).toBe("/jornada/10");
    expect(result.current.resultsUrl).toBe("/resultados");
    expect(result.current.recommendedAreaScore).toBe(60);
  });

  it("deve montar os textos da nota geral e do mínimo recomendado", async () => {
    vi.spyOn(journeyResultService, "getJourneyResult").mockResolvedValue(buildJourney());

    const { result } = renderVM();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.labels.declaredCountText).toBe(
      'declaredCount {"declared":2,"total":4}'
    );
    expect(result.current.labels.overallScoreAriaLabel).toContain('"score":76');
    expect(result.current.labels.areas.markerAriaLabel).toBe(
      'areas.markerAriaLabel {"value":60}'
    );
  });

  it("deve usar os nomes em inglês no idioma EN", async () => {
    mockLocale = "en";
    vi.spyOn(journeyResultService, "getJourneyResult").mockResolvedValue(buildJourney());

    const { result } = renderVM();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.journeyTitle).toBe("Data Protection Officer");
    expect(result.current.areaScoreGroups[0].title).toBe("Privacy");
  });

  it("deve indicar jornada ainda em andamento, com link para o resumo", async () => {
    vi.spyOn(journeyResultService, "getJourneyResult").mockResolvedValue(
      buildJourney({ status: "ongoing" })
    );

    const { result } = renderVM("10");
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("not_completed");
    expect(result.current.labels.errors).toMatchObject({
      title: "errors.notCompletedTitle",
      linkHref: "/jornada/10",
      retryButton: null,
    });
  });

  it.each([
    ["not_found", "errors.notFoundTitle"],
    ["forbidden", "errors.forbiddenTitle"],
    ["incomplete", "errors.incompleteTitle"],
  ] as const)("deve tratar o erro %s com link para Resultados, sem nova tentativa", async (type, title) => {
    vi.spyOn(journeyResultService, "getJourneyResult").mockRejectedValue(
      new JourneyResultRequestError(type, "Erro")
    );

    const { result } = renderVM();
    await waitFor(() => expect(result.current.error).toBe(type));

    expect(result.current.labels.errors).toMatchObject({
      title,
      linkHref: "/resultados",
      retryButton: null,
    });
  });

  it("deve oferecer nova tentativa após erro de servidor", async () => {
    const spy = vi
      .spyOn(journeyResultService, "getJourneyResult")
      .mockRejectedValueOnce(new JourneyResultRequestError("server_error", "Erro"))
      .mockResolvedValueOnce(buildJourney());

    const { result } = renderVM();
    await waitFor(() => expect(result.current.error).toBe("server_error"));
    expect(result.current.labels.errors?.retryButton).toBe("errors.retryButton");

    act(() => {
      result.current.handleRetry();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
  });

  it("deve tratar erro inesperado como erro de servidor", async () => {
    vi.spyOn(journeyResultService, "getJourneyResult").mockRejectedValue(new Error("boom"));

    const { result } = renderVM();

    await waitFor(() => expect(result.current.error).toBe("server_error"));
  });
});
