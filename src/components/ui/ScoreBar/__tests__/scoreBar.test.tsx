// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ScoreBar } from "../index";

describe("ScoreBar", () => {
  it("deve exibir o rótulo da faixa junto da nota", () => {
    render(<ScoreBar value={78} band="strong" bandLabel="Forte" ariaLabel="Nota geral: Forte, 78 de 100" />);

    expect(screen.getByText("Forte 78/100")).toBeTruthy();
    const bar = screen.getByRole("progressbar", { name: "Nota geral: Forte, 78 de 100" });
    expect(bar.getAttribute("aria-valuenow")).toBe("78");
    expect(bar.getAttribute("aria-valuetext")).toBe("Forte 78/100");
  });

  it.each([
    ["strong", "bg-emerald-500"],
    ["medium", "bg-amber-500"],
    ["weak", "bg-destructive"],
  ] as const)("deve usar a cor da faixa %s", (band, color) => {
    render(<ScoreBar value={50} band={band} bandLabel="X" ariaLabel="Nota" />);

    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.className).toContain(color);
    expect(fill.style.width).toBe("50%");
  });

  it("deve limitar a largura da barra entre 0 e 100", () => {
    render(<ScoreBar value={130} band="strong" bandLabel="Forte" ariaLabel="Nota" />);

    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("deve posicionar o marcador e descrevê-lo para o leitor de tela", () => {
    render(
      <ScoreBar
        value={40}
        band="weak"
        bandLabel="A desenvolver"
        ariaLabel="Área: A desenvolver, 40 de 100"
        marker={{ value: 60, ariaLabel: "Mínimo recomendado: 60" }}
      />
    );

    expect(screen.getByTestId("score-bar-marker").style.left).toBe("60%");
    const bar = screen.getByRole("progressbar");
    const description = document.getElementById(bar.getAttribute("aria-describedby") ?? "");
    expect(description?.textContent).toBe("Mínimo recomendado: 60");
  });

  it("não deve exibir marcador quando não informado", () => {
    render(<ScoreBar value={40} band="weak" bandLabel="A desenvolver" ariaLabel="Nota" />);

    expect(screen.queryByTestId("score-bar-marker")).toBeNull();
    expect(screen.getByRole("progressbar").hasAttribute("aria-describedby")).toBe(false);
  });
});
