// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CompetencyCard } from "../index";
import type { CompetencyCardProps } from "../competencyCard.types";

function renderCard(overrides?: Partial<CompetencyCardProps>) {
  const props: CompetencyCardProps = {
    id: 12,
    name: "Mapeamento de dados pessoais",
    description: "Identificar onde os dados pessoais estão.",
    difficulty: { level: "basic", label: "Básico" },
    answer: null,
    onAnswer: vi.fn(),
    yesLabel: "Sim",
    noLabel: "Não",
    difficultyPrefix: "Nível",
    ...overrides,
  };
  render(<CompetencyCard {...props} />);
  return props;
}

describe("CompetencyCard", () => {
  it("deve renderizar nome, descrição, badge e um radiogroup rotulado pelo nome", () => {
    renderCard();

    expect(screen.getByText("Identificar onde os dados pessoais estão.")).toBeDefined();
    expect(screen.getByTestId("difficulty-badge").textContent).toBe("Nível: Básico");
    const group = screen.getByRole("radiogroup", { name: "Mapeamento de dados pessoais" });
    expect(group).toBeDefined();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("não deve exibir o badge quando a dificuldade for nula", () => {
    renderCard({ difficulty: null });
    expect(screen.queryByTestId("difficulty-badge")).toBeNull();
  });

  it("deve marcar a opção respondida com aria-checked e deixá-la no Tab", () => {
    renderCard({ answer: false });

    const yes = screen.getByRole("radio", { name: "Sim" });
    const no = screen.getByRole("radio", { name: "Não" });
    expect(yes.getAttribute("aria-checked")).toBe("false");
    expect(no.getAttribute("aria-checked")).toBe("true");
    expect(yes.tabIndex).toBe(-1);
    expect(no.tabIndex).toBe(0);
  });

  it("sem resposta, só a primeira opção entra no Tab", () => {
    renderCard();
    expect(screen.getByRole("radio", { name: "Sim" }).tabIndex).toBe(0);
    expect(screen.getByRole("radio", { name: "Não" }).tabIndex).toBe(-1);
  });

  it("deve chamar onAnswer ao clicar e ao usar as setas", () => {
    const props = renderCard();

    fireEvent.click(screen.getByRole("radio", { name: "Não" }));
    expect(props.onAnswer).toHaveBeenLastCalledWith(false);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Sim" }), { key: "ArrowRight" });
    expect(props.onAnswer).toHaveBeenLastCalledWith(false);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Não" }), { key: "ArrowLeft" });
    expect(props.onAnswer).toHaveBeenLastCalledWith(true);
  });

  it("não deve responder quando desabilitado", () => {
    const props = renderCard({ disabled: true });
    fireEvent.click(screen.getByRole("radio", { name: "Sim" }));
    expect(props.onAnswer).not.toHaveBeenCalled();
  });
});
