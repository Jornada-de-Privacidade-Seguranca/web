// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as competenciesService from "@services/competenciesService";
import { ApiRequestError } from "@services/httpClient";
import { useCompetenciesQuestionnaireVM } from "../competenciesQuestionnaire.viewmodel";
import { useCompetenciesQuestionnaireStore } from "../competenciesQuestionnaire.store";
import type {
  CompetencyAnswerResponse,
  CompetencyOptionResponse,
} from "../competenciesQuestionnaire.types";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let mockLocale = "pt";
let mockJourneyNotFound = false;

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock, back: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@hooks/useJourneyContext", () => ({
  CURRENT_JOURNEY_QUERY_KEY: ["journey", "current"],
  useJourneyContext: () => ({
    journeyId: mockJourneyNotFound ? null : "78",
    profileId: mockJourneyNotFound ? null : "1",
    profileName: mockJourneyNotFound ? null : "Encarregado de Dados",
    domain: "privacy",
    isLoading: false,
    isError: mockJourneyNotFound,
    isNotFound: mockJourneyNotFound,
    refetch: vi.fn(),
  }),
}));

vi.mock("next-intl", () => {
  const messages: Record<string, string> = {
    "areas.areaIndicator": "Área {current} / {total}",
    "areas.areaCounter": "{answered} / {total} respondidas nesta área",
    "areas.otherAreaLabel": "Outras competências",
    "areas.nextAreaButton": "Próxima área",
    "areas.finishButton": "Finalizar",
    "areas.finalizeError": "Falha ao finalizar.",
    "areas.summaryLink": "Ver resumo da jornada",
    errorMessage: "Falha ao carregar.",
    saveError: "Falha ao salvar resposta.",
  };
  const t = (key: string, params?: Record<string, unknown>) => {
    let text = messages[key] ?? key;
    for (const [name, value] of Object.entries(params ?? {})) {
      text = text.replace(`{${name}}`, String(value));
    }
    return text;
  };
  return { useTranslations: () => t, useLocale: () => mockLocale };
});

function option(
  id: number,
  area: { id: number; name_pt: string; name_en: string } | null,
  difficulty: { id: number; name_pt: string; name_en: string } | null = null
): CompetencyOptionResponse {
  return {
    id,
    origin_pt: null,
    origin_en: null,
    name_pt: `Competência ${id}`,
    name_en: `Competency ${id}`,
    description_pt: `Descrição ${id}`,
    description_en: `Description ${id}`,
    knowledge_domain: null,
    knowledge_area: area,
    difficulty,
  };
}

const governance = { id: 1, name_pt: "Governança", name_en: "Governance" };
const security = { id: 2, name_pt: "Segurança", name_en: "Security" };
const advanced = { id: 4, name_pt: "Avançado", name_en: "Advanced" };
const basic = { id: 2, name_pt: "Básico", name_en: "Basic" };

// Fora de ordem de área de propósito: o front agrupa e ordena pelo id da área
const options = [
  option(1, security, advanced),
  option(2, governance, basic),
  option(3, governance),
  option(4, null),
];

function saved(competencyId: number, acquired: boolean): CompetencyAnswerResponse {
  return {
    id: 100 + competencyId,
    acquired,
    type_acquired: acquired ? 1 : 0,
    competency: option(competencyId, null),
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function mockLoad(savedAnswers: CompetencyAnswerResponse[] = []) {
  vi.spyOn(competenciesService, "getCompetencyOptions").mockResolvedValue(options);
  vi.spyOn(competenciesService, "getSavedCompetencies").mockResolvedValue(savedAnswers);
}

async function renderVM(areaIndexParam = "0") {
  const hook = renderHook(() => useCompetenciesQuestionnaireVM(areaIndexParam), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

function answerAll(result: { current: ReturnType<typeof useCompetenciesQuestionnaireVM> }) {
  act(() => {
    for (const competency of options) result.current.handleAnswer(competency.id, true);
  });
}

describe("useCompetenciesQuestionnaireVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    replaceMock.mockReset();
    mockLocale = "pt";
    mockJourneyNotFound = false;
    useCompetenciesQuestionnaireStore.getState().reset();
  });

  it("deve agrupar por área, ordenar pelo id da área e deixar as sem área por último", async () => {
    mockLoad();
    const { result } = await renderVM();

    expect(result.current.totalAreas).toBe(3);
    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
    expect(result.current.currentArea).toMatchObject({
      id: "1",
      name: "Governança",
      description: null,
    });
    expect(result.current.currentArea?.competencies.map((c) => c.id)).toEqual([2, 3]);
    expect(result.current.currentArea?.competencies[0].difficulty).toEqual({
      level: "basic",
      label: "Básico",
    });
    expect(result.current.currentArea?.competencies[1].difficulty).toBeNull();
    expect(result.current.labels.areaIndicator).toBe("Área 1 / 3");
  });

  it("deve exibir a última área com as competências sem área de conhecimento", async () => {
    mockLoad();
    const { result } = await renderVM("2");

    expect(result.current.currentArea).toMatchObject({ id: "other", name: "Outras competências" });
    expect(result.current.isLastArea).toBe(true);
    expect(result.current.labels.nextLabel).toBe("Finalizar");
  });

  it("deve usar os nomes em inglês quando o idioma for en", async () => {
    mockLocale = "en";
    mockLoad();
    const { result } = await renderVM("1");

    expect(result.current.currentArea?.name).toBe("Security");
    expect(result.current.currentArea?.competencies[0]).toMatchObject({
      name: "Competency 1",
      description: "Description 1",
      difficulty: { level: "advanced", label: "Advanced" },
    });
  });

  it("deve pré-preencher as respostas salvas e liberar o avanço só com a área completa", async () => {
    mockLoad([saved(2, true)]);
    const { result } = await renderVM();

    expect(result.current.answers).toEqual({ 2: true });
    expect(result.current.areaAnsweredCount).toBe(1);
    expect(result.current.areaTotalCount).toBe(2);
    expect(result.current.progressPercent).toBe(25);
    expect(result.current.isNextDisabled).toBe(true);

    act(() => result.current.handleAnswer(3, false));

    expect(result.current.labels.areaCounter).toBe("2 / 2 respondidas nesta área");
    expect(result.current.progressPercent).toBe(50);
    expect(result.current.isNextDisabled).toBe(false);
  });

  it("ao avançar, deve salvar todas as respostas das competências do perfil e ir para a próxima área", async () => {
    // Uma resposta salva de competência que saiu do perfil não é reenviada
    mockLoad([saved(2, true), saved(99, true)]);
    const saveSpy = vi
      .spyOn(competenciesService, "saveCompetencies")
      .mockResolvedValue([saved(2, true), saved(3, false)]);
    const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
    const { result } = await renderVM();

    act(() => result.current.handleAnswer(3, false));
    act(() => result.current.handleNext());

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/1"));
    expect(saveSpy).toHaveBeenCalledWith([
      { competency_id: 2, acquired: true },
      { competency_id: 3, acquired: false },
    ]);
    // O resumo passa a retomar a jornada a partir das novas respostas
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["journey", "current"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["journey-summary"] });
  });

  it("não deve avançar com a área incompleta", async () => {
    mockLoad();
    const saveSpy = vi.spyOn(competenciesService, "saveCompetencies");
    const { result } = await renderVM();

    act(() => result.current.handleNext());

    expect(saveSpy).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("na última área, deve salvar, finalizar e ir para o resultado, limpando as respostas em memória", async () => {
    mockLoad();
    const saveSpy = vi.spyOn(competenciesService, "saveCompetencies").mockResolvedValue([]);
    const finalizeSpy = vi
      .spyOn(competenciesService, "finalizeCurrentJourney")
      .mockResolvedValue({ journey_id: 78, status: "completed", finished_at: "2026-10-23 10:00:00" });
    const { result } = await renderVM("2");

    answerAll(result);
    act(() => result.current.handleNext());

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/jornada/78/resultado"));
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(finalizeSpy).toHaveBeenCalledTimes(1);
    expect(useCompetenciesQuestionnaireStore.getState().answers).toEqual({});
  });

  it("ao repetir uma finalização que falhou, deve refazer só a finalização", async () => {
    mockLoad();
    const saveSpy = vi.spyOn(competenciesService, "saveCompetencies").mockResolvedValue([]);
    const finalizeSpy = vi
      .spyOn(competenciesService, "finalizeCurrentJourney")
      .mockRejectedValueOnce(new ApiRequestError("erro", 500, "JOURNEY_FINALIZATION_FAILED"))
      .mockResolvedValueOnce({ journey_id: 78, status: "completed", finished_at: null });
    const { result } = await renderVM("2");

    answerAll(result);
    act(() => result.current.handleNext());

    await waitFor(() => expect(result.current.error).toBe("Falha ao finalizar."));
    expect(result.current.canRetry).toBe(true);
    expect(pushMock).not.toHaveBeenCalled();

    act(() => result.current.handleRetry());

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/jornada/78/resultado"));
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(finalizeSpy).toHaveBeenCalledTimes(2);
  });

  it("jornada incompleta (422): deve exibir a mensagem do backend com link para o resumo, sem nova tentativa", async () => {
    mockLoad();
    vi.spyOn(competenciesService, "saveCompetencies").mockResolvedValue([]);
    vi.spyOn(competenciesService, "finalizeCurrentJourney").mockRejectedValue(
      new ApiRequestError("Existem etapas obrigatorias pendentes.", 422, "INCOMPLETE_JOURNEY")
    );
    const { result } = await renderVM("2");

    answerAll(result);
    act(() => result.current.handleNext());

    await waitFor(() => expect(result.current.error).toBe("Existem etapas obrigatorias pendentes."));
    expect(result.current.errorLink).toEqual({
      label: "Ver resumo da jornada",
      href: "/jornada/78",
    });
    expect(result.current.canRetry).toBe(false);
  });

  it("jornada já finalizada (409): deve indicar o estado próprio", async () => {
    mockLoad();
    vi.spyOn(competenciesService, "saveCompetencies").mockResolvedValue([]);
    vi.spyOn(competenciesService, "finalizeCurrentJourney").mockRejectedValue(
      new ApiRequestError("Esta jornada ja foi finalizada.", 409, "JOURNEY_ALREADY_FINISHED")
    );
    const { result } = await renderVM("2");

    answerAll(result);
    act(() => result.current.handleNext());

    await waitFor(() => expect(result.current.isJourneyAlreadyFinished).toBe(true));
  });

  it("deve exibir a mensagem do backend em 422 ao salvar e o erro genérico nas demais falhas", async () => {
    mockLoad([saved(2, true), saved(3, true)]);
    const saveSpy = vi
      .spyOn(competenciesService, "saveCompetencies")
      .mockRejectedValueOnce(new ApiRequestError("Competência inválida.", 422, "VALIDATION_ERROR"))
      .mockRejectedValueOnce(new ApiRequestError("erro", 500))
      .mockResolvedValueOnce([]);
    const { result } = await renderVM();

    act(() => result.current.handleNext());
    await waitFor(() => expect(result.current.error).toBe("Competência inválida."));

    act(() => result.current.handleRetry());
    await waitFor(() => expect(result.current.error).toBe("Falha ao salvar resposta."));

    act(() => result.current.handleRetry());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/1"));
    expect(saveSpy).toHaveBeenCalledTimes(3);
  });

  it("deve bloquear o avanço e exibir erro quando as respostas salvas não carregarem", async () => {
    vi.spyOn(competenciesService, "getCompetencyOptions").mockResolvedValue(options);
    vi.spyOn(competenciesService, "getSavedCompetencies").mockRejectedValue(
      new ApiRequestError("erro", 500)
    );
    const { result } = await renderVM();

    await waitFor(() => expect(result.current.error).toBe("Falha ao carregar."));
    act(() => result.current.handleAnswer(2, true));
    act(() => result.current.handleAnswer(3, true));
    expect(result.current.isNextDisabled).toBe(true);
  });

  it("deve indicar jornada não encontrada pelo contexto ou por 404", async () => {
    vi.spyOn(competenciesService, "getCompetencyOptions").mockRejectedValue(
      new ApiRequestError("sem jornada", 404, "ONGOING_JOURNEY_NOT_FOUND")
    );
    vi.spyOn(competenciesService, "getSavedCompetencies").mockResolvedValue([]);
    const { result } = renderHook(() => useCompetenciesQuestionnaireVM("0"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isJourneyNotFound).toBe(true));
  });

  it.each(["9", "abc", "-1"])("deve redirecionar o índice inválido %s para a primeira área", async (param) => {
    mockLoad();
    await renderVM(param);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/jornada/atual/competencias/0"));
  });

  it("deve voltar para o resumo da jornada na primeira área e para a área anterior nas demais", async () => {
    mockLoad();
    const first = await renderVM("0");
    act(() => first.result.current.handleBack());
    expect(pushMock).toHaveBeenLastCalledWith("/jornada/78");

    const second = await renderVM("1");
    act(() => second.result.current.handleBack());
    expect(pushMock).toHaveBeenLastCalledWith("/jornada/atual/competencias/0");
  });

  it("deve manter as respostas ao trocar de área e descartá-las ao confirmar a saída", async () => {
    mockLoad();
    const first = await renderVM("0");
    act(() => first.result.current.handleAnswer(2, true));
    first.unmount();

    const second = await renderVM("1");
    expect(second.result.current.answers).toEqual({ 2: true });

    act(() => second.result.current.handleExit());
    expect(second.result.current.isExitModalOpen).toBe(true);
    act(() => second.result.current.handleConfirmExit());

    expect(pushMock).toHaveBeenCalledWith("/jornadas");
    expect(useCompetenciesQuestionnaireStore.getState().answers).toEqual({});
  });
});
