// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQuickActionsVM } from "../quickActions.viewmodel";

describe("useQuickActionsVM", () => {
  it("deve repassar título e ações de atalhos rápidos", () => {
    const actions = [
      {
        id: "act1",
        label: "Iniciar",
        description: "Nova jornada",
        href: "/jornadas",
        iconName: "play" as const,
      },
    ];

    const { result } = renderHook(() =>
      useQuickActionsVM({
        title: "Atalhos rápidos",
        sectionAriaLabel: "Ações rápidas",
        actions,
      })
    );

    expect(result.current.title).toBe("Atalhos rápidos");
    expect(result.current.actions).toHaveLength(1);
    expect(result.current.actions[0].href).toBe("/jornadas");
  });
});

