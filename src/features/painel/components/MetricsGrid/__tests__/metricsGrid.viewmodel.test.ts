// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMetricsGridVM } from "../metricsGrid.viewmodel";

describe("useMetricsGridVM", () => {
  it("deve mapear métricas corretamente para os cards do painel", () => {
    const { result } = renderHook(() =>
      useMetricsGridVM({
        metrics: {
          completedJourneys: 5,
          pendingJourneys: 2,
          averageScore: 89,
        },
        sectionTitle: "Indicadores",
        sectionAriaLabel: "Indicadores de desempenho",
        completedTitle: "Concluídas",
        completedSubtitle: "Finalizadas",
        pendingTitle: "Pendentes",
        pendingSubtitle: "Em andamento",
        averageScoreTitle: "Média",
        averageScoreSubtitle: "Média geral",
      })
    );

    expect(result.current.cards).toHaveLength(3);
    expect(result.current.cards[0].value).toBe(5);
    expect(result.current.cards[1].value).toBe(2);
    expect(result.current.cards[2].value).toBe(89);
    expect(result.current.cards[2].suffix).toBe("/ 100");
  });
});

