// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as preQuestionnaireService from "@services/preQuestionnaireService";
import type { UseJourneyContextReturn } from "@hooks/useJourneyContext";
import { useExperienceStepVM } from "../experienceStep.viewmodel";
import { EXPERIENCE_STEP_ID } from "../experienceStep.types";

const pushMock = vi.fn();
const refetchJourneyMock = vi.fn();
let mockPathname = "/jornada/10/experiencia-profissional";
let mockJourneyContext: UseJourneyContextReturn;

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname,
}));

vi.mock("@hooks/useJourneyContext", () => ({
  useJourneyContext: () => mockJourneyContext,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const translations: Record<string, string> = {
        "experience.stepTag": "PRÉ-QUESTIONÁRIO · EXPERIÊNCIA PROFISSIONAL",
        "experience.title": "Conte sobre sua experiência profissional",
        "experience.description": "Tempo de experiência profissional.",
        "experience.questionLabel.privacy": "Pergunta privacidade",
        "experience.questionLabel.security": "Pergunta segurança",
        "experience.questionLabel.joint": "Pergunta conjunta",
        "experience.options.none": "Nenhum",
        "experience.options.less-than-1-year": "Menos de 1 ano",
        "experience.options.1-3-years": "Entre 1 e 3 anos",
        "experience.options.4-6-years": "Entre 4 e 6 anos",
        "experience.options.7-10-years": "Entre 7 e 10 anos",
        "experience.options.10-plus-years": "Mais de 10 anos",
        loading: "Carregando pergunta...",
        errorMessage: "Falha ao carregar.",
        saveError: "Falha ao salvar resposta.",
      };
      return translations[key] ?? key;
    };
    return t;
  },
}));

function buildJourneyContext(
  overrides?: Partial<UseJourneyContextReturn>
): UseJourneyContextReturn {
  return {
    profileName: "Encarregado de Dados",
    domain: "privacy",
    isOngoing: true,
    isLoading: false,
    isError: false,
    isNotFound: false,
    refetch: refetchJourneyMock,
    ...overrides,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function mockStep(selectedOption: string | null = null) {
  return vi
    .spyOn(preQuestionnaireService, "getPreQuestionnaireStep")
    .mockResolvedValue({ slug: "10", step: EXPERIENCE_STEP_ID, selectedOption });
}

describe("useExperienceStepVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    refetchJourneyMock.mockReset();
    mockPathname = "/jornada/10/experiencia-profissional";
    mockJourneyContext = buildJourneyContext();
  });

  it("deve expor as 6 opções e usar o nome do perfil como título da jornada", async () => {
    mockStep();

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
    expect(result.current.options.map((o) => o.id)).toEqual([
      "none",
      "less-than-1-year",
      "1-3-years",
      "4-6-years",
      "7-10-years",
      "10-plus-years",
    ]);
    expect(result.current.selectedOption).toBeNull();
  });

  it.each([
    ["privacy", "Pergunta privacidade"],
    ["security", "Pergunta segurança"],
    ["joint", "Pergunta conjunta"],
  ] as const)("deve exibir a pergunta do domínio %s", async (domain, label) => {
    mockStep();
    mockJourneyContext = buildJourneyContext({ domain });

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.questionLabel).toBe(label);
    expect(result.current.isContinueDisabled).toBe(false);
  });

  it("deve permanecer carregando enquanto o contexto da jornada é buscado", async () => {
    mockStep();
    mockJourneyContext = buildJourneyContext({
      isLoading: true,
      profileName: null,
      domain: null,
    });

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(preQuestionnaireService.getPreQuestionnaireStep).toHaveBeenCalled()
    );
    expect(result.current.isLoading).toBe(true);
  });

  it("deve pré-selecionar a resposta salva na jornada em andamento", async () => {
    mockStep("4-6-years");

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.selectedOption).toBe("4-6-years"));
  });

  it("não deve reaproveitar resposta de jornada que não está em andamento", async () => {
    mockStep("4-6-years");
    mockJourneyContext = buildJourneyContext({ isOngoing: false });

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedOption).toBeNull();
  });

  it("handleContinue deve persistir com o id 'experience' e navegar para a etapa de inglês", async () => {
    mockStep();
    const saveSpy = vi
      .spyOn(preQuestionnaireService, "savePreQuestionnaireStep")
      .mockResolvedValue();

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(preQuestionnaireService.getPreQuestionnaireStep).toHaveBeenCalledWith(
      "10",
      "experience"
    );

    act(() => {
      result.current.handleSelectOption("less-than-1-year");
    });
    act(() => {
      result.current.handleContinue();
    });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith("10", "experience", {
        selectedOption: "less-than-1-year",
      });
      expect(pushMock).toHaveBeenCalledWith("/jornada/10/english");
    });
  });

  it("handleBack deve voltar para o resumo da jornada", async () => {
    mockStep();

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleBack();
    });

    expect(pushMock).toHaveBeenCalledWith("/jornada/10");
  });

  it("deve respeitar o prefixo /journey ao navegar", async () => {
    mockPathname = "/journey/10/experiencia-profissional";
    mockStep();

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleBack();
    });

    expect(pushMock).toHaveBeenCalledWith("/journey/10");
  });

  it("deve controlar a abertura, cancelamento e confirmação do modal de saída", async () => {
    mockStep();

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleExit();
    });
    expect(result.current.isExitModalOpen).toBe(true);

    act(() => {
      result.current.handleCancelExit();
    });
    expect(result.current.isExitModalOpen).toBe(false);

    act(() => {
      result.current.handleExit();
    });
    act(() => {
      result.current.handleConfirmExit();
    });
    expect(result.current.isExitModalOpen).toBe(false);
    expect(pushMock).toHaveBeenCalledWith("/jornadas");
  });

  it("falha no contexto da jornada deve exibir erro, desabilitar Continuar e refazer a busca no retry", async () => {
    mockStep();
    const saveSpy = vi.spyOn(preQuestionnaireService, "savePreQuestionnaireStep");
    mockJourneyContext = buildJourneyContext({
      isError: true,
      profileName: null,
      domain: null,
    });

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Falha ao carregar.");
    expect(result.current.isContinueDisabled).toBe(true);
    expect(result.current.isNotFound).toBe(false);
    expect(result.current.questionLabel).toBe("");

    act(() => {
      result.current.handleSelectOption("none");
    });
    act(() => {
      result.current.handleContinue();
    });
    expect(saveSpy).not.toHaveBeenCalled();

    act(() => {
      result.current.handleRetry();
    });
    expect(refetchJourneyMock).toHaveBeenCalledTimes(1);
  });

  it("jornada não encontrada deve sinalizar isNotFound sem exibir o banner de erro", async () => {
    mockStep();
    mockJourneyContext = buildJourneyContext({
      isError: true,
      isNotFound: true,
      profileName: null,
      domain: null,
    });

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isNotFound).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.journeysHref).toBe("/jornadas");
  });

  it("deve exibir banner de erro e desabilitar Continuar quando a jornada carregar com domínio nulo", async () => {
    mockStep();
    mockJourneyContext = buildJourneyContext({
      isLoading: false,
      isError: false,
      isNotFound: false,
      profileName: "Perfil Sem Dominio",
      domain: null,
    });

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Falha ao carregar.");
    expect(result.current.isContinueDisabled).toBe(true);
    expect(result.current.questionLabel).toBe("");
  });

  it("handleRetry deve reenviar a resposta quando o salvamento falhar", async () => {
    mockStep();
    const saveSpy = vi
      .spyOn(preQuestionnaireService, "savePreQuestionnaireStep")
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce();

    const { result } = renderHook(() => useExperienceStepVM("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleSelectOption("1-3-years");
    });
    act(() => {
      result.current.handleContinue();
    });

    await waitFor(() =>
      expect(result.current.error).toBe("Falha ao salvar resposta.")
    );
    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      result.current.handleRetry();
    });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
      expect(pushMock).toHaveBeenCalledWith("/jornada/10/english");
    });
  });
});
