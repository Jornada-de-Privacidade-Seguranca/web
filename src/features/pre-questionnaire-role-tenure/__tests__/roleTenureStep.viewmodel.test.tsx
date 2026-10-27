// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as preQuestionnaireService from "@services/preQuestionnaireService";
import { useRoleTenureStepVM } from "../roleTenureStep.viewmodel";
import { ROLE_TENURE_STEP_ID } from "../roleTenureStep.types";

const pushMock = vi.fn();

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

let mockProfileName: string | null = null;

let mockJourneyNotFound = false;

vi.mock("@hooks/useJourneyContext", () => ({
  useJourneyContext: () => ({
    journeyId: mockJourneyNotFound ? null : "data-governance",
    profileId: mockJourneyNotFound ? null : "1",
    profileName: mockProfileName,
    domain: null,
    isLoading: false,
    isError: mockJourneyNotFound,
    isNotFound: mockJourneyNotFound,
    refetch: vi.fn(),
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const translations: Record<string, string> = {
        "roleTenure.stepTag": "PRÉ-QUESTIONÁRIO · TEMPO DE ATUAÇÃO NO PERFIL",
        "roleTenure.title": "Tempo de atuação no perfil",
        "roleTenure.description":
          "Isso nos ajuda a entender quanto tempo você atua nesse perfil.",
        "roleTenure.questionLabel": "Tempo de atuação no perfil",
        "roleTenure.options.0-years": "Nenhum",
        "roleTenure.options.1-3-years": "Entre 1 e 3 anos",
        "roleTenure.options.4-6-years": "Entre 4 e 6 anos",
        "roleTenure.options.7-10-years": "Entre 7 e 10 anos",
        "roleTenure.options.10-plus-years": "Mais de 10 anos",
        "actions.back": "Voltar",
        "header.backAriaLabel": "Voltar para a etapa anterior",
        "actions.continue": "Continuar",
        "actions.saving": "Salvando...",
        "header.exitButton": "Sair",
        "header.exitAriaLabel": "Sair do pré-questionário",
        "exitModal.title": "Deseja sair do pré-questionário?",
        "exitModal.description": "Suas respostas anteriores já foram salvas.",
        "exitModal.cancelButton": "Continuar respondendo",
        "exitModal.confirmButton": "Sair da jornada",
        loading: "Carregando pergunta...",
        errorTitle: "Erro",
        errorMessage: "Falha ao carregar.",
        retryButton: "Tentar novamente",
        saveError: "Falha ao salvar resposta.",
      };
      return translations[key] ?? key;
    };
    return t;
  },
}));

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

describe("useRoleTenureStepVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    mockProfileName = null;
    mockJourneyNotFound = false;
  });

  it("deve carregar os dados da etapa e expor as 5 opções configuradas", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "role-tenure",
      journeyTitle: "Governança de Dados",
      selectedOption: null,
    });

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.journeyTitle).toBe("Governança de Dados");
    expect(result.current.selectedOption).toBeNull();
    expect(result.current.options).toHaveLength(5);
    expect(result.current.options.map((o) => o.id)).toEqual([
      "0-years",
      "1-3-years",
      "4-6-years",
      "7-10-years",
      "10-plus-years",
    ]);
  });

  it("deve usar o nome do perfil da jornada como título quando disponível", async () => {
    mockProfileName = "Encarregado de Dados";
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "role-tenure",
      journeyTitle: "Governança de Dados",
      selectedOption: null,
    });

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
  });

  it("deve pré-selecionar a opção caso venha preenchida do backend", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "role-tenure",
      journeyTitle: "Governança de Dados",
      selectedOption: "4-6-years",
    });

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.selectedOption).toBe("4-6-years");
  });

  it("deve atualizar selectedOption ao chamar handleSelectOption", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "role-tenure",
      selectedOption: null,
    });

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleSelectOption("7-10-years");
    });

    expect(result.current.selectedOption).toBe("7-10-years");
  });

  it("handleContinue deve persistir a resposta e navegar para a próxima etapa (formacao-academica)", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "role-tenure",
      selectedOption: null,
    });
    const saveSpy = vi
      .spyOn(preQuestionnaireService, "savePreQuestionnaireStep")
      .mockResolvedValue();

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleSelectOption("1-3-years");
    });

    act(() => {
      result.current.handleContinue();
    });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith("data-governance", "role-tenure", {
        selectedOption: "1-3-years",
      });
      expect(pushMock).toHaveBeenCalledWith(
        "/jornada/atual/formacao-academica"
      );
    });
  });

  it("handleBack deve navegar para a etapa anterior (english)", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "role-tenure",
      selectedOption: null,
    });

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleBack();
    });

    expect(pushMock).toHaveBeenCalledWith(
      "/jornada/atual/english"
    );
  });

  it("deve controlar a abertura, cancelamento e confirmação do modal de saída", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "role-tenure",
      selectedOption: null,
    });

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isExitModalOpen).toBe(false);

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

  it("deve enviar o identificador oficial do contrato ROLE_TENURE_STEP_ID ('role-tenure') para get e save", async () => {
    const getSpy = vi
      .spyOn(preQuestionnaireService, "getPreQuestionnaireStep")
      .mockResolvedValue({
        slug: "data-governance",
        step: ROLE_TENURE_STEP_ID,
        selectedOption: null,
      });
    const saveSpy = vi
      .spyOn(preQuestionnaireService, "savePreQuestionnaireStep")
      .mockResolvedValue();

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getSpy).toHaveBeenCalledWith("data-governance", ROLE_TENURE_STEP_ID);
    expect(ROLE_TENURE_STEP_ID).toBe("role-tenure");

    act(() => {
      result.current.handleSelectOption("1-3-years");
    });
    act(() => {
      result.current.handleContinue();
    });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        "data-governance",
        ROLE_TENURE_STEP_ID,
        {
          selectedOption: "1-3-years",
        }
      );
    });
  });

  it("handleRetry deve reenviar a resposta quando o salvamento falhar", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "role-tenure",
      selectedOption: null,
    });
    const getSpy = vi.mocked(preQuestionnaireService.getPreQuestionnaireStep);
    const saveSpy = vi
      .spyOn(preQuestionnaireService, "savePreQuestionnaireStep")
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce();

    const { result } = renderHook(() => useRoleTenureStepVM(), {
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
      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/formacao-academica");
    });
    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it("handleRetry deve refazer a busca da etapa quando o carregamento falhar", async () => {
    const getSpy = vi
      .spyOn(preQuestionnaireService, "getPreQuestionnaireStep")
      .mockRejectedValueOnce(new Error("network"))
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        slug: "data-governance",
        step: "role-tenure",
        selectedOption: null,
      });

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    // A query usa retry: 1, então o erro só aparece após a segunda falha
    await waitFor(
      () => expect(result.current.error).toBe("Falha ao carregar."),
      { timeout: 3000 }
    );

    act(() => {
      result.current.handleRetry();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(getSpy).toHaveBeenCalledTimes(3);
  });

  it("sem jornada em andamento deve sinalizar isNotFound sem buscar a etapa", async () => {
    mockJourneyNotFound = true;
    const getSpy = vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep");

    const { result } = renderHook(() => useRoleTenureStepVM(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isNotFound).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.journeysHref).toBe("/jornadas");
    expect(getSpy).not.toHaveBeenCalled();
  });
});
