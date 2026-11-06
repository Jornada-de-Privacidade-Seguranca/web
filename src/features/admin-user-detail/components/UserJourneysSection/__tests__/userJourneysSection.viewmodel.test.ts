import { describe, it, expect } from "vitest";
import { useUserJourneysSectionVM } from "../userJourneysSection.viewmodel";
import type { UserJourneysSectionProps } from "../userJourneysSection.types";
import type { AdminUserDetailLabels } from "../../../adminUserDetail.types";

describe("useUserJourneysSectionVM", () => {
  const mockLabels = {
    journeysTitle: "Jornadas",
    journeysEmptyTitle: "Vazio",
  } as AdminUserDetailLabels;

  it("deve computar allResultsHref e identificar presença de jornadas", () => {
    const props: UserJourneysSectionProps = {
      userId: "123",
      journeys: [
        {
          id: "j1",
          title: "LGPD",
          domain: "privacy",
          domainLabel: "Privacidade",
          completedAt: "2026-05-01",
          score: 80,
        },
      ],
      labels: mockLabels,
    };

    const vm = useUserJourneysSectionVM(props);

    expect(vm.hasJourneys).toBe(true);
    expect(vm.allResultsHref).toBe("/resultados?userId=123");
  });

  it("deve identificar hasJourneys como falso quando a lista for vazia", () => {
    const props: UserJourneysSectionProps = {
      userId: "123",
      journeys: [],
      labels: mockLabels,
    };

    const vm = useUserJourneysSectionVM(props);
    expect(vm.hasJourneys).toBe(false);
  });
});
