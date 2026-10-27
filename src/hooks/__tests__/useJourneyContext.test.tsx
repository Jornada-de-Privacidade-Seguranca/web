// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as journeyService from "@services/journeyService";
import { useJourneyContext } from "../useJourneyContext";

let mockLocale = "pt";
let mockUser: { id: number } | null = { id: 2 };

vi.mock("next-intl", () => ({
  useLocale: () => mockLocale,
}));

vi.mock("@hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser, isLoading: mockUser === null }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function buildJourney(domainId: number) {
  return {
    id: 78,
    journey_profile: {
      id: 1,
      name_pt: "Encarregado de Dados",
      name_en: "Data Protection Officer",
      knowledge_domain: { id: domainId, name_pt: "", name_en: "" },
    },
    status: "ongoing" as const,
  };
}

describe("useJourneyContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockLocale = "pt";
    mockUser = { id: 2 };
  });

  it.each([
    [1, "privacy"],
    [2, "security"],
    [3, "joint"],
  ] as const)("deve buscar a jornada em andamento do usuário e derivar o domínio %i como %s", async (domainId, domain) => {
    const spy = vi
      .spyOn(journeyService, "getCurrentJourney")
      .mockResolvedValue(buildJourney(domainId));

    const { result } = renderHook(() => useJourneyContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(spy).toHaveBeenCalledWith(2);
    expect(result.current.journeyId).toBe("78");
    expect(result.current.profileId).toBe("1");
    expect(result.current.domain).toBe(domain);
    expect(result.current.isError).toBe(false);
  });

  it("deve retornar o nome do perfil conforme o idioma", async () => {
    vi.spyOn(journeyService, "getCurrentJourney").mockResolvedValue(buildJourney(1));

    const { result, rerender } = renderHook(() => useJourneyContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.profileName).toBe("Encarregado de Dados")
    );

    mockLocale = "en";
    rerender();
    expect(result.current.profileName).toBe("Data Protection Officer");
  });

  it("deve permanecer carregando, sem buscar, enquanto a sessão não tiver usuário", () => {
    mockUser = null;
    const spy = vi.spyOn(journeyService, "getCurrentJourney");

    const { result } = renderHook(() => useJourneyContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("deve indicar ausência de jornada em andamento sem refazer a requisição", async () => {
    const spy = vi
      .spyOn(journeyService, "getCurrentJourney")
      .mockRejectedValue(
        new journeyService.JourneyRequestError("not_found", "Nenhuma jornada em andamento.")
      );

    const { result } = renderHook(() => useJourneyContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(true);
    expect(result.current.journeyId).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("deve indicar erro genérico em falhas de servidor e permitir refetch", async () => {
    const spy = vi
      .spyOn(journeyService, "getCurrentJourney")
      .mockRejectedValueOnce(new journeyService.JourneyRequestError("server_error", "x"))
      .mockRejectedValueOnce(new journeyService.JourneyRequestError("server_error", "x"))
      .mockResolvedValueOnce(buildJourney(2));

    const { result } = renderHook(() => useJourneyContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);

    result.current.refetch();

    await waitFor(() => expect(result.current.domain).toBe("security"));
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
