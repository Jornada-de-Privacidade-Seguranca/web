// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as journeyResultService from "@services/journeyResultService";
import { JourneyResultRequestError } from "@services/journeyResultService";
import { ApiRequestError } from "@services/httpClient";
import * as fileDownload from "@shared/utils/fileDownload";
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
    expect(result.current).not.toHaveProperty("categoryScores");
    expect(result.current).not.toHaveProperty("professionalProfile");
    expect(result.current.retakeUrl).toBe("/jornada/perfil/2");
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
      linkHref: "/jornada/perfil/2",
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
    let resolveRetry: (journey: ReturnType<typeof buildJourney>) => void = () => {};
    const retryResponse = new Promise<ReturnType<typeof buildJourney>>((resolve) => {
      resolveRetry = resolve;
    });
    const spy = vi
      .spyOn(journeyResultService, "getJourneyResult")
      .mockRejectedValueOnce(new JourneyResultRequestError("server_error", "Erro"))
      .mockReturnValueOnce(retryResponse);

    const { result } = renderVM();
    await waitFor(() => expect(result.current.error).toBe("server_error"));
    expect(result.current.labels.errors?.retryButton).toBe("errors.retryButton");

    act(() => {
      result.current.handleRetry();
    });

    // Enquanto a nova tentativa roda, a tela sai do erro e mostra o carregamento
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.error).toBeNull();

    resolveRetry(buildJourney());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
  });

  it("deve voltar para Resultados quando a jornada não tem perfil", async () => {
    vi.spyOn(journeyResultService, "getJourneyResult").mockResolvedValue(
      buildJourney({ journey_profile: null })
    );

    const { result } = renderVM();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.retakeUrl).toBe("/resultados");
  });

  it("deve tratar a rota sem id como jornada inexistente, sem buscar na API", () => {
    const spy = vi.spyOn(journeyResultService, "getJourneyResult");

    const { result } = renderVM("");

    expect(spy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("not_found");
    expect(result.current.labels.errors?.title).toBe("errors.notFoundTitle");
  });

  it("deve tratar erro inesperado como erro de servidor", async () => {
    vi.spyOn(journeyResultService, "getJourneyResult").mockRejectedValue(new Error("boom"));

    const { result } = renderVM();

    await waitFor(() => expect(result.current.error).toBe("server_error"));
  });

  describe("download do PDF", () => {
    const pdf = { blob: new Blob(["%PDF"], { type: "application/pdf" }), filename: "resultado-jornada-10-2026-11-09.pdf" };

    async function renderCompleted() {
      vi.spyOn(journeyResultService, "getJourneyResult").mockResolvedValue(buildJourney());
      const view = renderVM("10");
      await waitFor(() => expect(view.result.current.isLoading).toBe(false));
      return view;
    }

    it("deve habilitar o download só para jornada concluída", async () => {
      const { result } = await renderCompleted();
      expect(result.current.canDownloadPdf).toBe(true);
    });

    it("não deve habilitar o download para jornada em andamento", async () => {
      vi.spyOn(journeyResultService, "getJourneyResult").mockResolvedValue(buildJourney({ status: "ongoing" }));
      const { result } = renderVM("10");
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.canDownloadPdf).toBe(false);
    });

    it("deve baixar o PDF no idioma atual e salvar com o nome recebido", async () => {
      mockLocale = "en";
      let resolveDownload: (value: typeof pdf) => void = () => {};
      const download = vi
        .spyOn(journeyResultService, "downloadJourneyResultPdf")
        .mockReturnValue(new Promise((resolve) => { resolveDownload = resolve; }));
      const save = vi.spyOn(fileDownload, "saveBlobAsFile").mockImplementation(() => {});
      const { result } = await renderCompleted();

      act(() => result.current.handleDownloadPdf());

      await waitFor(() => expect(result.current.isDownloadingPdf).toBe(true));
      expect(download).toHaveBeenCalledWith("10", "en");

      act(() => resolveDownload(pdf));

      await waitFor(() => expect(result.current.isDownloadingPdf).toBe(false));
      expect(save).toHaveBeenCalledWith(pdf.blob, pdf.filename);
      expect(result.current.pdfError).toBeNull();
    });

    it("deve ignorar novos cliques enquanto o PDF é gerado", async () => {
      const download = vi
        .spyOn(journeyResultService, "downloadJourneyResultPdf")
        .mockReturnValue(new Promise(() => {}));
      const { result } = await renderCompleted();

      act(() => result.current.handleDownloadPdf());
      await waitFor(() => expect(result.current.isDownloadingPdf).toBe(true));
      act(() => result.current.handleDownloadPdf());

      expect(download).toHaveBeenCalledTimes(1);
    });

    it("deve mostrar a mensagem de erro e liberar o botão quando o download falhar", async () => {
      vi.spyOn(journeyResultService, "downloadJourneyResultPdf").mockRejectedValue(
        new ApiRequestError("Erro", 500)
      );
      const save = vi.spyOn(fileDownload, "saveBlobAsFile").mockImplementation(() => {});
      const { result } = await renderCompleted();

      act(() => result.current.handleDownloadPdf());

      await waitFor(() => expect(result.current.pdfError).toBe("pdf.error"));
      expect(result.current.isDownloadingPdf).toBe(false);
      expect(save).not.toHaveBeenCalled();
    });

    it("não deve mostrar mensagem no 401, que segue o fluxo de sessão expirada", async () => {
      vi.spyOn(journeyResultService, "downloadJourneyResultPdf").mockRejectedValue(
        new ApiRequestError("Sessão expirada", 401)
      );
      const { result } = await renderCompleted();

      act(() => result.current.handleDownloadPdf());

      await waitFor(() => expect(result.current.isDownloadingPdf).toBe(false));
      expect(result.current.pdfError).toBeNull();
    });
  });
});
