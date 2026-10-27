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
      if (key === "stepsCountAriaLabel") return `${params?.count} etapas`;
      if (key === "durationAriaLabel") return `${params?.minutes} minutos de duração`;
      if (key === "areasAriaLabel") return `${params?.count} áreas`;
      if (key === "competenciesAriaLabel") return `${params?.count} competências`;
      if (key === "estimatedMinutesText") return `${params?.minutes} min`;
      return key;
    };
    t.raw = (key: string) => {
      if (key === "steps") {
        return [{ title: "Etapa 1", description: "Descrição 1" }];
      }
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

vi.mock("@hooks/useJourneyContext", () => ({
  CURRENT_JOURNEY_QUERY_KEY: ["journey", "current"],
  useJourneyContext: () => ({
    journeyId: mockCurrentJourneyId,
    profileId: mockCurrentJourneyId ? mockCurrentProfileId : null,
    profileName: null,
    domain: null,
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
  stepsCount: 6,
  completedStepsCount: 0,
  estimatedMinutes: 3,
  areasCount: 1,
  competenciesCount: 3,
  status: "not_started",
  progress: { firstStepSlug: "experiencia-profissional", lastAnsweredStepSlug: null },
};

const completedJourney: JourneySummary = {
  ...notStartedJourney,
  id: "77",
  status: "completed",
  completedStepsCount: 6,
};

const profileSummary: JourneySummary = {
  ...notStartedJourney,
  id: null,
  estimatedMinutes: null,
  areasCount: null,
  competenciesCount: null,
};

const currentJourneyDetail = {
  id: 78,
  journey_profile: {
    id: 1,
    name_pt: "Encarregado de Dados",
    name_en: "Data Protection Officer",
    knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
  },
  status: "ongoing" as const,
  answers: {
    professional_experience: null,
    english_proficiency: null,
    profile_experience: null,
    higher_education_courses: [{ id: 24 }],
  },
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
  });

  describe("resumo da jornada em andamento", () => {
    it("deve exibir \"Retomar jornada\" e seguir pela primeira etapa sem criar jornada", async () => {
      mockCurrentJourneyId = "78";
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const { result } = await renderJourneySummary(notStartedJourney);

      expect(journeySummaryService.getJourneySummary).toHaveBeenCalledWith("78", "pt");
      expect(result.current.ctaLabel).toBe("actionResume");
      expect(result.current.ctaAriaLabel).toBe("actionResume — Encarregado de Dados");
      expect(result.current.isCtaDisabled).toBe(false);
      expect(result.current.journeyInProgressNotice).toBeNull();

      act(() => result.current.onStartJourney());

      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/experiencia-profissional");
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("deve retomar a partir da última etapa respondida", async () => {
      mockCurrentJourneyId = "78";
      const { result } = await renderJourneySummary({
        ...notStartedJourney,
        status: "in_progress",
        progress: {
          firstStepSlug: "experiencia-profissional",
          lastAnsweredStepSlug: "formacao-academica",
        },
      });

      expect(result.current.ctaLabel).toBe("actionResume");
      act(() => result.current.onStartJourney());
      expect(pushMock).toHaveBeenCalledWith("/jornada/atual/formacao-academica");
    });

    it("resumo do perfil da jornada em andamento deve retomá-la, sem aviso e sem criar outra", async () => {
      mockCurrentJourneyId = "78";
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const currentSpy = vi
        .spyOn(journeyService, "getCurrentJourney")
        .mockResolvedValue(currentJourneyDetail);
      const { result } = await renderProfileSummary();

      expect(result.current.ctaLabel).toBe("actionResume");
      expect(result.current.journeyInProgressNotice).toBeNull();
      expect(result.current.isCtaDisabled).toBe(false);

      act(() => result.current.onStartJourney());

      await waitFor(() => {
        expect(currentSpy).toHaveBeenCalledWith(2);
        expect(pushMock).toHaveBeenCalledWith("/jornada/atual/formacao-academica");
      });
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
      const createSpy = vi.spyOn(journeyService, "createJourney");
      const currentSpy = vi
        .spyOn(journeyService, "getCurrentJourney")
        .mockResolvedValue(currentJourneyDetail);
      const { result } = await renderProfileSummary();

      expect(result.current.ctaLabel).toBe("actionStart");
      expect(result.current.journeyInProgressNotice).toBe("journeyInProgressMessage");
      expect(result.current.isCtaDisabled).toBe(true);

      act(() => result.current.onStartJourney());
      expect(createSpy).not.toHaveBeenCalled();

      act(() => result.current.onResumeCurrentJourney());
      await waitFor(() => {
        expect(currentSpy).toHaveBeenCalledWith(2);
        expect(pushMock).toHaveBeenCalledWith("/jornada/atual/formacao-academica");
      });
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
        expect(pushMock).toHaveBeenCalledWith("/jornada/atual/experiencia-profissional");
      });
    });

    it("iniciar a partir do perfil deve criar a jornada e ir para a primeira etapa", async () => {
      const createSpy = vi
        .spyOn(journeyService, "createJourney")
        .mockResolvedValue({ id: 79 });
      const { result } = await renderProfileSummary();

      expect(journeySummaryService.getProfileSummary).toHaveBeenCalledWith("1", "pt");
      expect(result.current.ctaLabel).toBe("actionStart");
      act(() => result.current.onStartJourney());

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith(2, 1);
        expect(pushMock).toHaveBeenCalledWith("/jornada/atual/experiencia-profissional");
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

  it("onDismiss deve voltar no histórico", async () => {
    const { result } = await renderJourneySummary(notStartedJourney);

    act(() => result.current.onDismiss());
    expect(backMock).toHaveBeenCalled();
  });
});
