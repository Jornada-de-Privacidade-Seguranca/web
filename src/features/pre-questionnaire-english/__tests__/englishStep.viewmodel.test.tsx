// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as preQuestionnaireService from "@services/preQuestionnaireService";
import { useEnglishStepVM } from "../englishStep.viewmodel";

const pushMock = vi.fn();

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/journey/data-governance/english",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const translations: Record<string, string> = {
        "header.stepTag": "PRÉ-QUESTIONÁRIO · NÍVEL DE PROFICIÊNCIA EM INGLÊS",
        "english.stepTag": "PRÉ-QUESTIONÁRIO · NÍVEL DE PROFICIÊNCIA EM INGLÊS",
        "english.title": "Nível de proficiência em inglês",
        "english.description": "Isso nos ajuda a calibrar a complexidade.",
        "english.questionLabel": "Nível de proficiência em inglês",
        "english.options.none": "Nenhum",
        "english.options.basic-reading": "Básico - Leitura",
        "english.options.intermediate-reading-writing": "Intermediário - Leitura e Escritura",
        "english.options.advanced-fluent": "Avançado - Fluente",
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

describe("useEnglishStepVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
  });

  it("deve carregar os dados da etapa e expor as 4 opções configuradas", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "english",
      journeyTitle: "Governança de Dados",
      selectedOption: null,
    });

    const { result } = renderHook(() => useEnglishStepVM("data-governance"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.journeyTitle).toBe("Governança de Dados");
    expect(result.current.selectedOption).toBeNull();
    expect(result.current.options).toHaveLength(4);
    expect(result.current.options.map((o) => o.id)).toEqual([
      "none",
      "basic-reading",
      "intermediate-reading-writing",
      "advanced-fluent",
    ]);
  });

  it("deve pré-selecionar a opção caso venha preenchida do backend", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "english",
      journeyTitle: "Governança de Dados",
      selectedOption: "basic-reading",
    });

    const { result } = renderHook(() => useEnglishStepVM("data-governance"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.selectedOption).toBe("basic-reading");
  });

  it("deve atualizar selectedOption ao chamar handleSelectOption", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "english",
      selectedOption: null,
    });

    const { result } = renderHook(() => useEnglishStepVM("data-governance"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleSelectOption("advanced-fluent");
    });

    expect(result.current.selectedOption).toBe("advanced-fluent");
  });

  it("handleContinue deve persistir a resposta e navegar para a próxima etapa", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "english",
      selectedOption: null,
    });
    const saveSpy = vi
      .spyOn(preQuestionnaireService, "savePreQuestionnaireStep")
      .mockResolvedValue();

    const { result } = renderHook(() => useEnglishStepVM("data-governance"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleSelectOption("intermediate-reading-writing");
    });

    act(() => {
      result.current.handleContinue();
    });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith("data-governance", "english", {
        selectedOption: "intermediate-reading-writing",
      });
      expect(pushMock).toHaveBeenCalledWith(
        "/journey/data-governance/tempo-atuacao-perfil"
      );
    });
  });

  it("handleBack deve ser undefined nesta primeira etapa ativa para evitar rota inexistente 404", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "english",
      selectedOption: null,
    });

    const { result } = renderHook(() => useEnglishStepVM("data-governance"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.handleBack).toBeUndefined();
    expect(result.current.labels.backAriaLabel).toBe("Voltar para a etapa anterior");
  });

  it("deve controlar a abertura, cancelamento e confirmação do modal de saída", async () => {
    vi.spyOn(preQuestionnaireService, "getPreQuestionnaireStep").mockResolvedValue({
      slug: "data-governance",
      step: "english",
      selectedOption: null,
    });

    const { result } = renderHook(() => useEnglishStepVM("data-governance"), {
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
});
