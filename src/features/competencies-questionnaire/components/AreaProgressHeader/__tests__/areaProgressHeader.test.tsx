// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AreaProgressHeader } from "../index";

describe("AreaProgressHeader", () => {
  it("deve exibir a área atual e a barra de progresso acessível", () => {
    render(
      <AreaProgressHeader
        areaIndicator="Área 2 / 5"
        progressPercent={42.4}
        progressAriaLabel="Progresso do questionário de competências"
        onExit={vi.fn()}
        exitLabel="Sair"
        exitAriaLabel="Sair do questionário"
      />
    );

    expect(screen.getByText("Área 2 / 5")).toBeDefined();
    const bar = screen.getByRole("progressbar", { name: "Progresso do questionário de competências" });
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("deve limitar o progresso a 100 e chamar onExit", () => {
    const onExit = vi.fn();
    render(
      <AreaProgressHeader
        areaIndicator="Área 5 / 5"
        progressPercent={130}
        progressAriaLabel="Progresso"
        onExit={onExit}
        exitLabel="Sair"
        exitAriaLabel="Sair do questionário"
      />
    );

    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    fireEvent.click(screen.getByRole("button", { name: "Sair do questionário" }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
