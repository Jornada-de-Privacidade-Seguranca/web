// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as academicCoursesService from "@services/academicCoursesService";
import { ApiRequestError } from "@services/httpClient";
import { useAcademicStepVM } from "../academicStep.viewmodel";

const pushMock = vi.fn();
let mockLocale = "pt";
let mockJourneyNotFound = false;

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@hooks/useJourneyContext", () => ({
  useJourneyContext: () => ({
    journeyId: mockJourneyNotFound ? null : "78",
    profileId: mockJourneyNotFound ? null : "1",
    profileName: "Encarregado de Dados",
    domain: "privacy",
    isLoading: false,
    isError: mockJourneyNotFound,
    isNotFound: mockJourneyNotFound,
    refetch: vi.fn(),
  }),
}));

vi.mock("next-intl", () => {
  const messages: Record<string, string> = {
    "academic.counterLabel": "{count} curso(s) selecionado(s)",
    "academic.removeCourseAriaLabel": "Remover {course}",
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
  t.raw = (key: string) =>
    key === "academic.typeLegends"
      ? { "1": "Bacharelado/Licenciatura/Tecnólogo", "2": "lato sensu", "3": "stricto sensu" }
      : key;
  return { useTranslations: () => t, useLocale: () => mockLocale };
});

const graduation = { id: 1, name_pt: "Graduação", name_en: "Graduation" };
const postgrad = { id: 2, name_pt: "Pós-Graduação", name_en: "Postgraduate" };
const doctorate = { id: 4, name_pt: "Doutorado", name_en: "Doctorate" };

const options = [
  { id: 10, name_pt: "Ciência da Computação", name_en: "Computer Science", type: graduation },
  { id: 11, name_pt: "Direito", name_en: "Law", type: graduation },
  { id: 12, name_pt: "Privacidade e Proteção de Dados", name_en: "Privacy", type: postgrad },
  { id: 13, name_pt: "Doutorado em Direito", name_en: "PhD in Law", type: doctorate },
  { id: 14, name_pt: "Curso sem nível", name_en: "No level", type: null },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function mockServices(selected: typeof options = []) {
  vi.spyOn(academicCoursesService, "getCourseOptions").mockResolvedValue(options);
  vi.spyOn(academicCoursesService, "getSelectedCourses").mockResolvedValue(selected);
}

async function renderVM() {
  const hook = renderHook(() => useAcademicStepVM(), { wrapper: createWrapper() });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe("useAcademicStepVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    mockLocale = "pt";
    mockJourneyNotFound = false;
  });

  it("deve derivar as abas pelo nível, ordenadas e com legenda, ignorando cursos sem nível", async () => {
    mockServices();
    const { result } = await renderVM();

    expect(result.current.groups).toEqual([
      { id: "1", label: "Graduação (Bacharelado/Licenciatura/Tecnólogo)" },
      { id: "2", label: "Pós-Graduação (lato sensu)" },
      // Nível sem legenda cadastrada exibe apenas o nome
      { id: "4", label: "Doutorado" },
    ]);
    expect(result.current.activeGroupId).toBe("1");
    expect(result.current.visibleCourses.map((c) => c.label)).toEqual([
      "Ciência da Computação",
      "Direito",
    ]);
    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
  });

  it("deve exibir os nomes conforme o idioma", async () => {
    mockLocale = "en";
    mockServices();
    const { result } = await renderVM();

    expect(result.current.groups[0].label).toBe(
      "Graduation (Bacharelado/Licenciatura/Tecnólogo)"
    );
    expect(result.current.visibleCourses.map((c) => c.label)).toEqual([
      "Computer Science",
      "Law",
    ]);
  });

  it("deve filtrar apenas a aba ativa, ignorando acentos e maiúsculas", async () => {
    mockServices();
    const { result } = await renderVM();

    act(() => result.current.handleSearchChange("  CIENCIA "));
    expect(result.current.visibleCourses.map((c) => c.id)).toEqual(["10"]);

    act(() => result.current.handleGroupChange("2"));
    expect(result.current.visibleCourses).toEqual([]);

    act(() => result.current.handleSearchChange("protecao"));
    expect(result.current.visibleCourses.map((c) => c.id)).toEqual(["12"]);
  });

  it("deve pré-marcar a seleção salva e exibir chips de todas as abas", async () => {
    mockServices([options[1], options[2]]);
    const { result } = await renderVM();

    expect(result.current.selectedCourses.map((c) => c.id)).toEqual(["11", "12"]);
    expect(result.current.labels.counterLabel).toBe("2 curso(s) selecionado(s)");
    expect(result.current.isContinueDisabled).toBe(false);
  });

  it("deve alternar e remover cursos da seleção", async () => {
    mockServices([options[1]]);
    const { result } = await renderVM();

    act(() => result.current.handleToggleCourse("10"));
    expect(result.current.selectedCourses.map((c) => c.id)).toEqual(["10", "11"]);

    act(() => result.current.handleToggleCourse("10"));
    act(() => result.current.handleRemoveCourse("11"));
    expect(result.current.selectedCourses).toEqual([]);
    expect(result.current.labels.removeCourseAriaLabel("Direito")).toBe("Remover Direito");
  });

  it("deve salvar a seleção ao continuar e navegar para certificações profissionais", async () => {
    mockServices([options[1]]);
    const saveSpy = vi
      .spyOn(academicCoursesService, "saveSelectedCourses")
      .mockResolvedValue([options[1], options[2]]);
    const { result } = await renderVM();

    act(() => result.current.handleToggleCourse("12"));
    act(() => result.current.handleContinue());

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith([11, 12]);
      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/certificacoes-profissionais");
    });
  });

  it("deve permitir continuar sem nenhum curso, enviando lista vazia", async () => {
    mockServices();
    const saveSpy = vi
      .spyOn(academicCoursesService, "saveSelectedCourses")
      .mockResolvedValue([]);
    const { result } = await renderVM();

    act(() => result.current.handleContinue());

    await waitFor(() => expect(saveSpy).toHaveBeenCalledWith([]));
  });

  it("deve voltar para o tempo de atuação no perfil", async () => {
    mockServices();
    const { result } = await renderVM();

    act(() => result.current.handleBack());
    expect(pushMock).toHaveBeenCalledWith("/jornada/atual/tempo-atuacao-perfil");
  });

  it("falha ao carregar a seleção salva deve exibir erro e manter Continuar desabilitado", async () => {
    vi.spyOn(academicCoursesService, "getCourseOptions").mockResolvedValue(options);
    const selectedSpy = vi
      .spyOn(academicCoursesService, "getSelectedCourses")
      .mockRejectedValueOnce(new ApiRequestError("erro", 500))
      .mockRejectedValueOnce(new ApiRequestError("erro", 500))
      .mockResolvedValue([]);
    const saveSpy = vi.spyOn(academicCoursesService, "saveSelectedCourses");
    const { result } = await renderVM();

    await waitFor(() => expect(result.current.error).toBe("Falha ao carregar."));
    expect(result.current.isContinueDisabled).toBe(true);

    act(() => result.current.handleContinue());
    expect(saveSpy).not.toHaveBeenCalled();

    act(() => result.current.handleRetry());
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.isContinueDisabled).toBe(false);
    expect(selectedSpy).toHaveBeenCalledTimes(3);
  });

  it("falha ao carregar os cursos deve exibir o banner de erro", async () => {
    vi.spyOn(academicCoursesService, "getCourseOptions").mockRejectedValue(
      new ApiRequestError("erro", 500)
    );
    vi.spyOn(academicCoursesService, "getSelectedCourses").mockResolvedValue([]);
    const { result } = await renderVM();

    await waitFor(() => expect(result.current.error).toBe("Falha ao carregar."));
    expect(result.current.isJourneyNotFound).toBe(false);
  });

  it("404 ONGOING_JOURNEY_NOT_FOUND deve sinalizar jornada não encontrada, sem nova tentativa", async () => {
    const optionsSpy = vi
      .spyOn(academicCoursesService, "getCourseOptions")
      .mockRejectedValue(new ApiRequestError("sem jornada", 404, "ONGOING_JOURNEY_NOT_FOUND"));
    vi.spyOn(academicCoursesService, "getSelectedCourses").mockRejectedValue(
      new ApiRequestError("sem jornada", 404, "ONGOING_JOURNEY_NOT_FOUND")
    );
    const { result } = await renderVM();

    await waitFor(() => expect(result.current.isJourneyNotFound).toBe(true));
    expect(optionsSpy).toHaveBeenCalledTimes(1);
    expect(result.current.journeysHref).toBe("/jornadas");
  });

  it("jornada da rota inexistente também deve sinalizar jornada não encontrada", async () => {
    mockJourneyNotFound = true;
    mockServices();
    const { result } = await renderVM();

    expect(result.current.isJourneyNotFound).toBe(true);
  });

  it("422 ao salvar deve manter na etapa e exibir a mensagem do backend", async () => {
    mockServices();
    vi.spyOn(academicCoursesService, "saveSelectedCourses").mockRejectedValue(
      new ApiRequestError("O curso selecionado é inválido.", 422, "VALIDATION_ERROR")
    );
    const { result } = await renderVM();

    act(() => result.current.handleToggleCourse("10"));
    act(() => result.current.handleContinue());

    await waitFor(() => expect(result.current.error).toBe("O curso selecionado é inválido."));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("falha ao salvar deve exibir erro genérico e permitir nova tentativa", async () => {
    mockServices();
    const saveSpy = vi
      .spyOn(academicCoursesService, "saveSelectedCourses")
      .mockRejectedValueOnce(new ApiRequestError("erro", 500))
      .mockResolvedValueOnce([options[0]]);
    const { result } = await renderVM();

    act(() => result.current.handleToggleCourse("10"));
    act(() => result.current.handleContinue());
    await waitFor(() => expect(result.current.error).toBe("Falha ao salvar resposta."));

    act(() => result.current.handleRetry());
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledTimes(2);
      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/certificacoes-profissionais");
    });
  });

  it("deve controlar o modal de saída", async () => {
    mockServices();
    const { result } = await renderVM();

    act(() => result.current.handleExit());
    expect(result.current.isExitModalOpen).toBe(true);
    act(() => result.current.handleCancelExit());
    expect(result.current.isExitModalOpen).toBe(false);
    act(() => result.current.handleExit());
    act(() => result.current.handleConfirmExit());
    expect(pushMock).toHaveBeenCalledWith("/jornadas");
  });
});
