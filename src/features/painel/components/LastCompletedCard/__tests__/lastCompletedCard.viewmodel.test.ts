// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLastCompletedCardVM } from "../lastCompletedCard.viewmodel";
import type { LastCompletedAssessment } from "@features/painel/painel.types";

vi.mock("next-intl", () => ({
  useFormatter: () => ({ dateTime: () => "14 de outubro de 2026" }),
  useTranslations: () => (key: string) => key,
}));

const assessment: LastCompletedAssessment = {
  id: "10",
  title: "Encarregado de Dados",
  completedAt: "2026-10-14T16:30:00Z",
  score: 76,
};

describe("useLastCompletedCardVM", () => {
  it("deve levar ao resultado da jornada concluída", () => {
    const { result } = renderHook(() =>
      useLastCompletedCardVM({ assessment, emptyMessage: "Sem resultados" })
    );

    expect(result.current.resultHref).toBe("/jornada/10/resultado");
  });

  it("não deve montar link sem jornada concluída", () => {
    const { result } = renderHook(() =>
      useLastCompletedCardVM({ assessment: null, emptyMessage: "Sem resultados" })
    );

    expect(result.current.resultHref).toBe("#");
  });
});
