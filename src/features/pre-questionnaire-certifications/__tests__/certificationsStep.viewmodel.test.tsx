// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as certificationsService from "@services/certificationsService";
import { ApiRequestError } from "@services/httpClient";
import { MAX_CERTIFICATIONS, useCertificationsStepVM } from "../certificationsStep.viewmodel";

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
    "certifications.counterLabel": "{count} certificação(ões) selecionada(s)",
    "certifications.limitReachedLabel": "Você atingiu o limite de {max} certificações selecionadas.",
    "certifications.removeCertificationAriaLabel": "Remover {certification}",
    "certifications.otherGroupLabel": "Outras",
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

const privacy = { id: 1, name_pt: "Privacidade", name_en: "Privacy" };
const security = { id: 2, name_pt: "Segurança da Informação", name_en: "Information Security" };

// Fora de ordem alfabética e de domínio de propósito: o front ordena
const options = [
  { id: 30, name: "CISSP", issuer: "ISC2", knowledge_domain: security },
  { id: 10, name: "CIPP/E", issuer: "IAPP", knowledge_domain: privacy },
  { id: 11, name: "Ética em Dados", issuer: null, knowledge_domain: privacy },
  { id: 12, name: "CDPO/BR", issuer: "IAPP", knowledge_domain: privacy },
  { id: 40, name: "Certificação Livre", issuer: null, knowledge_domain: null },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function mockServices(selected: typeof options = [], available: typeof options = options) {
  vi.spyOn(certificationsService, "getCertificationOptions").mockResolvedValue(available);
  vi.spyOn(certificationsService, "getSelectedCertifications").mockResolvedValue(selected);
}

async function renderVM() {
  const hook = renderHook(() => useCertificationsStepVM(), { wrapper: createWrapper() });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe("useCertificationsStepVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    mockLocale = "pt";
    mockJourneyNotFound = false;
  });

  it("deve derivar as abas por domínio, ordenadas, com \"Outras\" por último", async () => {
    mockServices();
    const { result } = await renderVM();

    expect(result.current.groups).toEqual([
      { id: "1", label: "Privacidade" },
      { id: "2", label: "Segurança da Informação" },
      { id: "other", label: "Outras" },
    ]);
    expect(result.current.activeGroupId).toBe("1");
    expect(result.current.journeyTitle).toBe("Encarregado de Dados");
    expect(result.current.maxSelectable).toBe(MAX_CERTIFICATIONS);
  });

  it("deve exibir os nomes dos domínios conforme o idioma", async () => {
    mockLocale = "en";
    mockServices();
    const { result } = await renderVM();

    expect(result.current.groups.map((g) => g.label)).toEqual([
      "Privacy",
      "Information Security",
      "Outras",
    ]);
  });

  it("deve ordenar as certificações da aba ativa por nome, ignorando acentos", async () => {
    mockServices();
    const { result } = await renderVM();

    expect(result.current.visibleCertifications.map((c) => c.label)).toEqual([
      "CDPO/BR",
      "CIPP/E",
      "Ética em Dados",
    ]);

    act(() => result.current.handleGroupChange("other"));
    expect(result.current.visibleCertifications.map((c) => c.id)).toEqual(["40"]);
  });

  it("deve buscar apenas na aba ativa, pelo nome, ignorando acentos e maiúsculas", async () => {
    mockServices();
    const { result } = await renderVM();

    act(() => result.current.handleSearchChange("  ETICA "));
    expect(result.current.visibleCertifications.map((c) => c.id)).toEqual(["11"]);

    act(() => result.current.handleSearchChange("cissp"));
    expect(result.current.visibleCertifications).toEqual([]);
  });

  it("deve pré-marcar a seleção salva e exibir chips de todas as abas", async () => {
    mockServices([options[0], options[1]]);
    const { result } = await renderVM();

    expect(result.current.selectedCertifications.map((c) => c.id)).toEqual(["10", "30"]);
    expect(result.current.labels.counterLabel).toBe("2 certificação(ões) selecionada(s)");
    expect(result.current.isContinueDisabled).toBe(false);
  });

  it("deve alternar e remover certificações da seleção", async () => {
    mockServices([options[1]]);
    const { result } = await renderVM();

    act(() => result.current.handleToggleCertification("12"));
    expect(result.current.selectedCertifications.map((c) => c.id)).toEqual(["12", "10"]);

    act(() => result.current.handleToggleCertification("12"));
    act(() => result.current.handleRemoveCertification("10"));
    expect(result.current.selectedCertifications).toEqual([]);
    expect(result.current.labels.removeCertificationAriaLabel("CIPP/E")).toBe("Remover CIPP/E");
  });

  it("deve respeitar o limite de certificações selecionadas", async () => {
    const many = Array.from({ length: MAX_CERTIFICATIONS + 1 }, (_, i) => ({
      id: i + 1,
      name: `Certificação ${String(i + 1).padStart(3, "0")}`,
      issuer: null,
      knowledge_domain: privacy,
    }));
    mockServices(many.slice(0, MAX_CERTIFICATIONS), many);
    const { result } = await renderVM();

    expect(result.current.isLimitReached).toBe(true);
    expect(result.current.labels.limitReachedLabel).toBe(
      `Você atingiu o limite de ${MAX_CERTIFICATIONS} certificações selecionadas.`
    );

    // Com o limite atingido, não adiciona mais nenhuma
    act(() => result.current.handleToggleCertification(String(MAX_CERTIFICATIONS + 1)));
    expect(result.current.selectedCertifications).toHaveLength(MAX_CERTIFICATIONS);

    // Desmarcar uma libera a seleção de outra
    act(() => result.current.handleRemoveCertification("1"));
    expect(result.current.isLimitReached).toBe(false);
    act(() => result.current.handleToggleCertification(String(MAX_CERTIFICATIONS + 1)));
    expect(result.current.selectedCertifications).toHaveLength(MAX_CERTIFICATIONS);
  });

  it("deve salvar a seleção ao continuar e navegar para competências", async () => {
    mockServices([options[1]]);
    const saveSpy = vi
      .spyOn(certificationsService, "saveSelectedCertifications")
      .mockResolvedValue([options[1], options[0]]);
    const { result } = await renderVM();

    act(() => result.current.handleToggleCertification("30"));
    act(() => result.current.handleContinue());

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith([10, 30]);
      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias");
    });
  });

  it("deve permitir continuar sem certificações, enviando lista vazia", async () => {
    mockServices();
    const saveSpy = vi
      .spyOn(certificationsService, "saveSelectedCertifications")
      .mockResolvedValue([]);
    const { result } = await renderVM();

    act(() => result.current.handleContinue());

    await waitFor(() => expect(saveSpy).toHaveBeenCalledWith([]));
  });

  it("deve voltar para a formação acadêmica", async () => {
    mockServices();
    const { result } = await renderVM();

    act(() => result.current.handleBack());
    expect(pushMock).toHaveBeenCalledWith("/jornada/atual/formacao-academica");
  });

  it("falha ao carregar a seleção salva deve exibir erro e manter Continuar desabilitado", async () => {
    vi.spyOn(certificationsService, "getCertificationOptions").mockResolvedValue(options);
    const selectedSpy = vi
      .spyOn(certificationsService, "getSelectedCertifications")
      .mockRejectedValueOnce(new ApiRequestError("erro", 500))
      .mockRejectedValueOnce(new ApiRequestError("erro", 500))
      .mockResolvedValue([]);
    const saveSpy = vi.spyOn(certificationsService, "saveSelectedCertifications");
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

  it("404 ONGOING_JOURNEY_NOT_FOUND deve sinalizar jornada não encontrada, sem nova tentativa", async () => {
    const optionsSpy = vi
      .spyOn(certificationsService, "getCertificationOptions")
      .mockRejectedValue(new ApiRequestError("sem jornada", 404, "ONGOING_JOURNEY_NOT_FOUND"));
    vi.spyOn(certificationsService, "getSelectedCertifications").mockRejectedValue(
      new ApiRequestError("sem jornada", 404, "ONGOING_JOURNEY_NOT_FOUND")
    );
    const { result } = await renderVM();

    await waitFor(() => expect(result.current.isJourneyNotFound).toBe(true));
    expect(optionsSpy).toHaveBeenCalledTimes(1);
  });

  it("sem jornada em andamento no contexto também deve sinalizar jornada não encontrada", async () => {
    mockJourneyNotFound = true;
    mockServices();
    const { result } = await renderVM();

    expect(result.current.isJourneyNotFound).toBe(true);
  });

  it("422 ao salvar deve manter na etapa e exibir a mensagem do backend", async () => {
    mockServices();
    vi.spyOn(certificationsService, "saveSelectedCertifications").mockRejectedValue(
      new ApiRequestError("O campo certification_ids não pode ter mais de 100 itens.", 422, "VALIDATION_ERROR")
    );
    const { result } = await renderVM();

    act(() => result.current.handleToggleCertification("10"));
    act(() => result.current.handleContinue());

    await waitFor(() =>
      expect(result.current.error).toBe("O campo certification_ids não pode ter mais de 100 itens.")
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("falha ao salvar deve exibir erro genérico e permitir nova tentativa", async () => {
    mockServices();
    const saveSpy = vi
      .spyOn(certificationsService, "saveSelectedCertifications")
      .mockRejectedValueOnce(new ApiRequestError("erro", 500))
      .mockResolvedValueOnce([options[1]]);
    const { result } = await renderVM();

    act(() => result.current.handleToggleCertification("10"));
    act(() => result.current.handleContinue());
    await waitFor(() => expect(result.current.error).toBe("Falha ao salvar resposta."));

    act(() => result.current.handleRetry());
    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledTimes(2);
      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias");
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
