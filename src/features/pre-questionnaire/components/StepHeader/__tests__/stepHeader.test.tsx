// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { StepHeader } from "../index";

describe("StepHeader", () => {
  it("deve exibir a tag da etapa e o nome do perfil cortados com reticências e com title", () => {
    render(
      <StepHeader
        stepTag="PRÉ-QUESTIONÁRIO · COMPETÊNCIAS"
        journeyTitle="Encarregado pelo Tratamento de Dados Pessoais"
        onExit={vi.fn()}
      />,
    );

    for (const text of [
      "PRÉ-QUESTIONÁRIO · COMPETÊNCIAS",
      "Encarregado pelo Tratamento de Dados Pessoais",
    ]) {
      const element = screen.getByText(text);
      expect(element.getAttribute("title")).toBe(text);
      expect(element.className).toContain("truncate");
    }
  });

  it("deve omitir textos ausentes e chamar onExit pelo botão Sair", () => {
    const onExit = vi.fn();
    render(
      <StepHeader
        onExit={onExit}
        exitLabel="Sair"
        exitAriaLabel="Sair da etapa"
      />,
    );

    expect(screen.queryByTitle(/./)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Sair da etapa" }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
