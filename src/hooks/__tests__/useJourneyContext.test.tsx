// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as journeyService from "@services/journeyService";
import { useJourneyContext } from "../useJourneyContext";

let mockLocale = "pt";

vi.mock("next-intl", () => ({
  useLocale: () => mockLocale,
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

function buildJourney(domainId: number, status: "ongoing" | "completed" = "ongoing") {
  return {
    id: 10,
    journey_profile: {
      id: 2,
      name_pt: "Encarregado de Dados",
      name_en: "Data Protection Officer",
      knowledge_domain: { id: domainId, name_pt: "", name_en: "" },
    },
    status,
  };
}

describe("useJourneyContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockLocale = "pt";
  });

  it.each([
    [1, "privacy"],
    [2, "security"],
    [3, "joint"],
  ] as const)("deve derivar o domínio %i como %s", async (domainId, domain) => {
    vi.spyOn(journeyService, "getJourney").mockResolvedValue(buildJourney(domainId));

    const { result } = renderHook(() => useJourneyContext("10"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.domain).toBe(domain);
    expect(result.current.isOngoing).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("deve retornar o nome do perfil conforme o idioma", async () => {
    vi.spyOn(journeyService, "getJourney").mockResolvedValue(buildJourney(1));

    const { result, rerender } = renderHook(() => useJourneyContext("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.profileName).toBe("Encarregado de Dados")
    );

    mockLocale = "en";
    rerender();
    expect(result.current.profileName).toBe("Data Protection Officer");
  });

  it("deve indicar jornada não encontrada sem refazer a requisição", async () => {
    const getSpy = vi
      .spyOn(journeyService, "getJourney")
      .mockRejectedValue(
        new journeyService.JourneyRequestError("not_found", "Jornada não encontrada.")
      );

    const { result } = renderHook(() => useJourneyContext("999"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(true);
    expect(result.current.profileName).toBeNull();
    expect(result.current.domain).toBeNull();
    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it("deve indicar erro genérico em falhas de servidor e permitir refetch", async () => {
    const getSpy = vi
      .spyOn(journeyService, "getJourney")
      .mockRejectedValueOnce(new journeyService.JourneyRequestError("server_error", "x"))
      .mockRejectedValueOnce(new journeyService.JourneyRequestError("server_error", "x"))
      .mockResolvedValueOnce(buildJourney(2));

    const { result } = renderHook(() => useJourneyContext("10"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);

    result.current.refetch();

    await waitFor(() => expect(result.current.domain).toBe("security"));
    expect(getSpy).toHaveBeenCalledTimes(3);
  });
});
