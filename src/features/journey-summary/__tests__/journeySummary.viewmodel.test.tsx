// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import * as journeySummaryService from "@services/journeySummaryService";
import * as journeyService from "@services/journeyService";
import { JourneySummaryRequestError } from "@services/journeySummaryService";
import { ApiRequestError } from "@services/httpClient";
import { useJourneySummaryVM } from "../journeySummary.viewmodel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { JourneySummary } from "../journeySummary.types";

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock("next-intl", () => ({
  useLocale: () => "pt",
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) => {
      if (key === "durationAriaLabel") return `${params?.minutes} minutos de duração`;
      if (key === "areasAriaLabel") return `${params?.count} áreas`;
      if (key === "competenciesAriaLabel") return `${params?.count} competências`;
      if (key === "estimatedMinutesText") return `${params?.minutes} min`;
      if (key === "instructions.items.estimatedTime.description") return `${params?.minutes} minutos`;
      if (key === "instructions.intro") return `intro: ${params?.domain}`;
      if (key === "lastScoreText") return `Última pontuação ${params?.score}/100`;
      return key;
    };
    return t;
  },
}));

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 2 }, isLoading: false }),
}));

// Jornada em andamento do usuário, verificada pelo resumo ao abrir a página
let mockCurrentJourneyId: string | null = null;
let mockCurrentProfileId = "1";
let mockCurrentJourneyLoading = false;
let mockResumeAreaIndex = 0;

vi.mock("@hooks/useJourneyContext", () => ({
  CURRENT_JOURNEY_QUERY_KEY: ["journey", "current"],
  useJourneyContext: () => ({
    journeyId: mockCurrentJourneyId,
    profileId: mockCurrentJourneyId ? mockCurrentProfileId : null,
    profileName: null,
    domain: null,
    resumeAreaIndex: mockResumeAreaIndex,
    isLoading: mockCurrentJourneyLoading,
    isError: !mockCurrentJourneyId && !mockCurrentJourneyLoading,
    isNotFound: !mockCurrentJourneyId && !mockCurrentJourneyLoading,
    refetch: vi.fn(),
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

const notStartedJourney: JourneySummary = {
  id: "78",
  profileId: "1",
  title: "Encarregado de Dados",
  estimatedMinutes: 3,
  areasCount: 1,
  competenciesCount: 3,
  domain: "security",
  status: "not_started",
};

const completedJourney: JourneySummary = {
  ...notStartedJourney,
  id: "77",
  status: "completed",
};

const profileSummary: JourneySummary = {
  ...notStartedJourney,
  id: null,
  estimatedMinutes: null,
  areasCount: null,
  competenciesCount: null,
};

async function renderJourneySummary(summary: JourneySummary) {
  vi.spyOn(journeySummaryService, "getJourneySummary").mockResolvedValue(summary);
  const hook = renderHook(() => useJourneySummaryVM({ journeyId: summary.id ?? "" }), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

async function renderProfileSummary() {
  vi.spyOn(journeySummaryService, "getProfileSummary").mockResolvedValue(profileSummary);
  const hook = renderHook(() => useJourneySummaryVM({ profileId: "1" }), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe("useJourneySummaryVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    backMock.mockReset();
    mockCurrentJourneyId = null;
    mockCurrentProfileId = "1";
    mockCurrentJourneyLoading = false;
    mockResumeAreaIndex = 0;
    vi.spyOn(journeySummaryService, "getLastProfileScore").mockResolvedValue(null);
  });

  describe("resumo da jornada em andamento", () => {
    it("deve exibir \"Continuar jornada\" e seguir para a primeira área pendente sem criar jornada", async () => {
      mockCurrentJourneyId = "78";
      mockResumeAreaIndex = 2;
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const { result } = await renderJourneySummary(notStartedJourney);

      expect(journeySummaryService.getJourneySummary).toHaveBeenCalledWith("78", "pt");
      expect(result.current.ctaLabel).toBe("actionResume");
      expect(result.current.ctaAriaLabel).toBe("actionResume — Encarregado de Dados");
      expect(result.current.isCtaDisabled).toBe(false);
      expect(result.current.journeyInProgressNotice).toBeNull();

      act(() => result.current.onStartJourney());

      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/2");
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("resumo do perfil da jornada em andamento deve retomá-la, sem aviso e sem criar outra", async () => {
      mockCurrentJourneyId = "78";
      mockResumeAreaIndex = 1;
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const { result } = await renderProfileSummary();

      expect(result.current.ctaLabel).toBe("actionResume");
      expect(result.current.journeyInProgressNotice).toBeNull();
      expect(result.current.isCtaDisabled).toBe(false);

      act(() => result.current.onStartJourney());

      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/1");
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe("outra jornada com uma jornada em andamento", () => {
    it("jornada concluída deve exibir o aviso e bloquear o Refazer", async () => {
      mockCurrentJourneyId = "78";
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const { result } = await renderJourneySummary(completedJourney);

      expect(result.current.ctaLabel).toBe("actionRetake");
      expect(result.current.journeyInProgressNotice).toBe("journeyInProgressMessage");
      expect(result.current.isCtaDisabled).toBe(true);

      act(() => result.current.onStartJourney());
      expect(createSpy).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });

    it("resumo de outro perfil deve exibir o aviso, bloquear o Iniciar e permitir retomar a atual", async () => {
      mockCurrentJourneyId = "78";
      // A jornada em andamento é de outro perfil
      mockCurrentProfileId = "9";
      mockResumeAreaIndex = 3;
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const { result } = await renderProfileSummary();

      expect(result.current.ctaLabel).toBe("actionStart");
      expect(result.current.journeyInProgressNotice).toBe("journeyInProgressMessage");
      expect(result.current.isCtaDisabled).toBe(true);

      act(() => result.current.onStartJourney());
      expect(createSpy).not.toHaveBeenCalled();

      act(() => result.current.onResumeCurrentJourney());
      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/3");
    });
  });

  describe("sem jornada em andamento", () => {
    it("refazer uma jornada concluída deve criar uma jornada nova do mesmo perfil", async () => {
      const createSpy = vi
        .spyOn(journeyService, "createJourney")
        .mockResolvedValue({ id: 79 });
      const { result } = await renderJourneySummary(completedJourney);

      expect(result.current.journeyInProgressNotice).toBeNull();
      expect(result.current.isCtaDisabled).toBe(false);
      act(() => result.current.onStartJourney());

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith(2, 1);
        expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/0");
      });
    });

    it("iniciar a partir do perfil deve criar a jornada e ir para a primeira área de competências", async () => {
      const createSpy = vi
        .spyOn(journeyService, "createJourney")
        .mockResolvedValue({ id: 79 });
      const { result } = await renderProfileSummary();

      expect(journeySummaryService.getProfileSummary).toHaveBeenCalledWith("1", "pt");
      expect(result.current.ctaLabel).toBe("actionStart");
      act(() => result.current.onStartJourney());

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith(2, 1);
        expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/0");
      });
    });

    it("409 na criação (jornada iniciada em paralelo) deve exibir o aviso e bloquear o botão", async () => {
      vi.spyOn(journeyService, "createJourney").mockRejectedValue(
        new ApiRequestError("Voce ja possui uma jornada em andamento.", 409, "JOURNEY_IN_PROGRESS")
      );
      const { result } = await renderProfileSummary();

      act(() => result.current.onStartJourney());

      await waitFor(() =>
        expect(result.current.journeyInProgressNotice).toBe("journeyInProgressMessage")
      );
      expect(result.current.isCtaDisabled).toBe(true);
      expect(result.current.startError).toBeNull();
      expect(pushMock).not.toHaveBeenCalled();
    });

    it("falha genérica ao criar deve exibir a mensagem de erro sem o aviso", async () => {
      vi.spyOn(journeyService, "createJourney").mockRejectedValue(
        new ApiRequestError("erro", 500)
      );
      const { result } = await renderProfileSummary();

      act(() => result.current.onStartJourney());

      await waitFor(() => expect(result.current.startError).toBe("startErrorMessage"));
      expect(result.current.journeyInProgressNotice).toBeNull();
    });
  });

  describe("instruções do questionário", () => {
    it("deve montar as instruções com o domínio e a duração estimada da jornada", async () => {
      const { result } = await renderJourneySummary(notStartedJourney);

      expect(result.current.labels.instructionsIntro).toBe("intro: instructions.domains.security");
      expect(result.current.instructionItems.map((item) => item.id)).toEqual([
        "objective",
        "sincerity",
        "navigation",
        "estimatedTime",
      ]);
      expect(result.current.instructionItems[3].description).toBe("3 minutos");
    });

    it("sem domínio e sem duração, deve usar o texto conjunto e o tempo sem minutos", async () => {
      const { result } = await renderJourneySummary({
        ...notStartedJourney,
        id: "80",
        domain: null,
        estimatedMinutes: null,
      });

      expect(result.current.journey?.id).toBe("80");

      expect(result.current.labels.instructionsIntro).toBe("intro: instructions.domains.joint");
      expect(result.current.instructionItems[3].description).toBe(
        "instructions.items.estimatedTime.fallbackDescription"
      );
    });
  });

  it("deve manter o botão bloqueado enquanto verifica a jornada em andamento", async () => {
    mockCurrentJourneyLoading = true;
    const createSpy = vi.spyOn(journeyService, "createJourney");
    const { result } = await renderProfileSummary();

    expect(result.current.isCtaDisabled).toBe(true);
    act(() => result.current.onStartJourney());
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("deve expor error 'not_found' quando o serviço rejeitar com not_found", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockRejectedValue(
      new JourneySummaryRequestError("not_found", "Jornada não encontrada.")
    );

    const { result } = renderHook(() => useJourneySummaryVM({ journeyId: "999" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe("not_found"));
    expect(result.current.journey).toBeNull();
  });

  it("deve expor error 'server_error' para falhas genéricas", async () => {
    vi.spyOn(journeySummaryService, "getJourneySummary").mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useJourneySummaryVM({ journeyId: "78" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe("server_error"));
  });

  it("onDismiss deve voltar para a listagem de jornadas", async () => {
    const { result } = await renderJourneySummary(notStartedJourney);

    act(() => result.current.onDismiss());
    expect(pushMock).toHaveBeenCalledWith("/jornadas");
    expect(backMock).not.toHaveBeenCalled();
  });

  describe("cabeçalho", () => {
    it("deve trazer o domínio da jornada para a tag", async () => {
      const { result } = await renderJourneySummary(notStartedJourney);

      expect(result.current.labels.domainLabel).toBe("domainLabels.security");
    });

    it("sem domínio informado, não deve exibir a tag", async () => {
      const { result } = await renderJourneySummary({ ...notStartedJourney, domain: null });

      expect(result.current.labels.domainLabel).toBeNull();
    });

    it("deve buscar a última pontuação do perfil para o usuário", async () => {
      vi.mocked(journeySummaryService.getLastProfileScore).mockResolvedValue(82);
      const { result } = await renderProfileSummary();

      await waitFor(() => expect(result.current.lastScore).toBe(82));
      expect(journeySummaryService.getLastProfileScore).toHaveBeenCalledWith(2, "1");
      expect(result.current.labels.lastScoreText(82)).toBe("Última pontuação 82/100");
    });

    it("sem jornada concluída do perfil, não deve haver última pontuação", async () => {
      const { result } = await renderJourneySummary(notStartedJourney);

      await waitFor(() => expect(journeySummaryService.getLastProfileScore).toHaveBeenCalled());
      expect(result.current.lastScore).toBeNull();
    });
  });
});
