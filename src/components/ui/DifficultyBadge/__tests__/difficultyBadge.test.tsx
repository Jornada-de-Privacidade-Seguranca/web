// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DifficultyBadge } from "../index";

describe("DifficultyBadge", () => {
  it.each([
    ["beginner", "slate"],
    ["basic", "emerald"],
    ["intermediate", "amber"],
    ["advanced", "orange"],
    ["specialist", "red"],
  ] as const)("deve usar a cor do nível %s", (level, color) => {
    render(<DifficultyBadge level={level} label="Nível X" />);
    expect(screen.getByTestId("difficulty-badge").className).toContain(`bg-${color}-500/15`);
  });

  it("deve usar a cor neutra para nível desconhecido", () => {
    render(<DifficultyBadge level={null} label="Mestre" />);
    expect(screen.getByTestId("difficulty-badge").className).toContain("bg-muted");
  });

  it("deve expor o texto acessível com o prefixo, sem depender só da cor", () => {
    render(<DifficultyBadge level="basic" label="Básico" srPrefix="Nível" />);
    expect(screen.getByTestId("difficulty-badge").textContent).toBe("Nível: Básico");
  });
});
