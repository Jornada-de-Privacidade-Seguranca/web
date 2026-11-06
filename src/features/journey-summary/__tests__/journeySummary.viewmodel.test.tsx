// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import * as journeySummaryService from "@services/journeySummaryService";
import * as journeyService from "@services/journeyService";
import * as journeyProfileService from "@services/journeyProfileService";
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
      if (key === "profileSelection.description") return `perfil inicial: ${params?.profile}`;
      if (key === "profileSelection.mismatchNotice") return `primeira jornada: ${params?.profile}`;
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

// Usuário do /me; o perfil de jornada inicial muda conforme o cenário
const setAuthMock = vi.fn();
let mockInitialProfile: { id: number; name: string; nameEn: string } | null = null;

vi.mock("@hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: 2,
      profile: {
        journey_profile_id: mockInitialProfile?.id ?? null,
        journey_profile_name: mockInitialProfile?.name ?? null,
        journey_profile_name_en: mockInitialProfile?.nameEn ?? null,
      },
    },
    isLoading: false,
    setAuth: setAuthMock,
  }),
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
    mockInitialProfile = null;
    setAuthMock.mockReset();
    vi.spyOn(journeySummaryService, "getLastProfileScore").mockResolvedValue(null);
    // Por padrão o usuário já tem jornadas e inicia direto
    vi.spyOn(journeySummaryService, "hasAnyJourney").mockResolvedValue(true);
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

  describe("perfil de jornada inicial", () => {
    const selectedProfile = {
      journey_profile_id: 1,
      journey_profile: {
        id: 1,
        name_pt: "Encarregado de Dados",
        name_en: "Data Protection Officer",
        description_pt: null,
        description_en: null,
        type: 1,
      },
    };

    async function renderFirstJourney() {
      vi.mocked(journeySummaryService.hasAnyJourney).mockResolvedValue(false);
      const hook = await renderProfileSummary();
      await waitFor(() => expect(hook.result.current.isCtaDisabled).toBe(false));
      return hook;
    }

    it("usuário novo deve confirmar o perfil no diálogo, salvar e criar a jornada", async () => {
      const selectSpy = vi
        .spyOn(journeyProfileService, "selectInitialJourneyProfile")
        .mockResolvedValue(selectedProfile);
      const createSpy = vi.spyOn(journeyService, "createJourney").mockResolvedValue({ id: 80 });
      const { result } = await renderFirstJourney();

      act(() => result.current.onStartJourney());

      expect(result.current.profileSelection.isOpen).toBe(true);
      expect(result.current.profileSelection.description).toBe("perfil inicial: Encarregado de Dados");
      expect(result.current.profileSelection.confirmLabel).toBe("profileSelection.confirm");
      expect(selectSpy).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();

      act(() => result.current.profileSelection.onConfirm());

      await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/0"));
      expect(selectSpy).toHaveBeenCalledWith(1);
      expect(createSpy).toHaveBeenCalledWith(2, 1);
      expect(selectSpy.mock.invocationCallOrder[0]).toBeLessThan(
        createSpy.mock.invocationCallOrder[0]
      );
      expect(setAuthMock).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: expect.objectContaining({
            journey_profile_id: 1,
            journey_profile_name: "Encarregado de Dados",
            journey_profile_name_en: "Data Protection Officer",
          }),
        })
      );
      expect(result.current.profileSelection.isOpen).toBe(false);
    });

    it("cancelar deve fechar o diálogo sem salvar o perfil nem criar a jornada", async () => {
      const selectSpy = vi.spyOn(journeyProfileService, "selectInitialJourneyProfile");
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const { result } = await renderFirstJourney();

      act(() => result.current.onStartJourney());
      act(() => result.current.profileSelection.onCancel());

      expect(result.current.profileSelection.isOpen).toBe(false);
      expect(selectSpy).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("usuário com jornadas deve iniciar direto, sem o diálogo", async () => {
      const selectSpy = vi.spyOn(journeyProfileService, "selectInitialJourneyProfile");
      const createSpy = vi.spyOn(journeyService, "createJourney").mockResolvedValue({ id: 81 });
      const { result } = await renderProfileSummary();

      act(() => result.current.onStartJourney());

      await waitFor(() => expect(createSpy).toHaveBeenCalledWith(2, 1));
      expect(result.current.profileSelection.isOpen).toBe(false);
      expect(selectSpy).not.toHaveBeenCalled();
    });

    it("usuário sem jornadas com o perfil inicial já salvo deve iniciar direto nesse perfil", async () => {
      mockInitialProfile = { id: 1, name: "Encarregado de Dados", nameEn: "Data Protection Officer" };
      const createSpy = vi.spyOn(journeyService, "createJourney").mockResolvedValue({ id: 82 });
      const { result } = await renderFirstJourney();

      expect(result.current.initialProfileNotice).toBeNull();
      act(() => result.current.onStartJourney());

      await waitFor(() => expect(createSpy).toHaveBeenCalledWith(2, 1));
      expect(result.current.profileSelection.isOpen).toBe(false);
    });

    it("outro perfil que não o inicial salvo deve bloquear o Iniciar e apontar para o escolhido", async () => {
      mockInitialProfile = { id: 5, name: "Controlador", nameEn: "Controller" };
      const createSpy = vi.spyOn(journeyService, "createJourney");
      vi.mocked(journeySummaryService.hasAnyJourney).mockResolvedValue(false);
      const { result } = await renderProfileSummary();

      await waitFor(() => expect(result.current.initialProfileNotice).not.toBeNull());
      expect(result.current.initialProfileNotice).toEqual({
        message: "primeira jornada: Controlador",
        linkLabel: "profileSelection.goToSelectedProfile",
        href: "/jornada/perfil/5",
      });
      expect(result.current.isCtaDisabled).toBe(true);

      act(() => result.current.onStartJourney());
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("deve manter o Iniciar bloqueado enquanto verifica se o usuário tem jornadas", async () => {
      vi.mocked(journeySummaryService.hasAnyJourney).mockReturnValue(new Promise(() => {}));
      const { result } = await renderProfileSummary();

      expect(result.current.isCtaDisabled).toBe(true);
    });

    it.each([
      ["JOURNEY_PROFILE_SELECTION_REQUIRED", 422, "selectionRequired"],
      ["JOURNEY_PROFILE_MISMATCH", 422, "profileMismatch"],
      ["JOURNEY_PROFILE_SELECTION_LOCKED", 409, "selectionLocked"],
      ["JOURNEY_PROFILE_NOT_FOUND", 404, "profileNotFound"],
    ])("%s deve exibir a mensagem própria no diálogo", async (code, status, errorKey) => {
      vi.spyOn(journeyProfileService, "selectInitialJourneyProfile").mockRejectedValue(
        new ApiRequestError("erro", status, code)
      );
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const { result } = await renderFirstJourney();

      act(() => result.current.onStartJourney());
      act(() => result.current.profileSelection.onConfirm());

      await waitFor(() =>
        expect(result.current.profileSelection.error).toBe(`profileSelection.errors.${errorKey}`)
      );
      expect(result.current.profileSelection.isOpen).toBe(true);
      expect(result.current.profileSelection.confirmLabel).toBe("profileSelection.confirm");
      expect(createSpy).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });

    it("falha geral deve exibir a mensagem e permitir tentar novamente", async () => {
      const selectSpy = vi
        .spyOn(journeyProfileService, "selectInitialJourneyProfile")
        .mockRejectedValueOnce(new ApiRequestError("erro", 500))
        .mockResolvedValueOnce(selectedProfile);
      vi.spyOn(journeyService, "createJourney").mockResolvedValue({ id: 83 });
      const { result } = await renderFirstJourney();

      act(() => result.current.onStartJourney());
      act(() => result.current.profileSelection.onConfirm());

      await waitFor(() =>
        expect(result.current.profileSelection.error).toBe("profileSelection.errors.generic")
      );
      expect(result.current.profileSelection.confirmLabel).toBe("profileSelection.retry");

      act(() => result.current.profileSelection.onConfirm());

      await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/jornada/atual/competencias/0"));
      expect(selectSpy).toHaveBeenCalledTimes(2);
    });

    it("seleção obrigatória recusada ao iniciar direto deve abrir o diálogo com a mensagem", async () => {
      // A verificação do histórico falhou: o front inicia direto e o backend recusa
      vi.mocked(journeySummaryService.hasAnyJourney).mockRejectedValue(new Error("boom"));
      vi.spyOn(journeyService, "createJourney").mockRejectedValue(
        new ApiRequestError("erro", 422, "JOURNEY_PROFILE_SELECTION_REQUIRED")
      );
      const { result } = await renderProfileSummary();
      await waitFor(() => expect(result.current.isCtaDisabled).toBe(false));

      act(() => result.current.onStartJourney());

      await waitFor(() => expect(result.current.profileSelection.isOpen).toBe(true));
      expect(result.current.profileSelection.error).toBe("profileSelection.errors.selectionRequired");
      expect(result.current.startError).toBeNull();
    });

    it("perfil diferente recusado ao iniciar direto deve exibir a mensagem própria na tela", async () => {
      vi.spyOn(journeyService, "createJourney").mockRejectedValue(
        new ApiRequestError("erro", 422, "JOURNEY_PROFILE_MISMATCH")
      );
      const { result } = await renderProfileSummary();

      act(() => result.current.onStartJourney());

      await waitFor(() =>
        expect(result.current.startError).toBe("profileSelection.errors.profileMismatch")
      );
      expect(result.current.profileSelection.isOpen).toBe(false);
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
