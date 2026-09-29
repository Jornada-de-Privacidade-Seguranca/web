// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TranslateIcon } from "@hugeicons/core-free-icons";
import { SingleChoiceQuestionStep } from "../index";
import type { SingleChoiceQuestionStepProps } from "../singleChoiceQuestionStep.types";

describe("SingleChoiceQuestionStep", () => {
  const defaultOptions = [
    { id: "opt-1", label: "Opção 1" },
    { id: "opt-2", label: "Opção 2" },
    { id: "opt-3", label: "Opção 3" },
  ];

  function createProps(
    overrides?: Partial<SingleChoiceQuestionStepProps>
  ): SingleChoiceQuestionStepProps {
    return {
      icon: TranslateIcon,
      title: "Título da Pergunta",
      description: "Descrição de apoio",
      questionLabel: "Qual o seu nível?",
      options: defaultOptions,
      selectedOption: null,
      onSelectOption: vi.fn(),
      onContinue: vi.fn(),
      onExit: vi.fn(),
      journeyTitle: "Governança de Dados",
      stepTag: "PRÉ-QUESTIONÁRIO",
      continueLabel: "Continuar",
      savingLabel: "Salvando...",
      backLabel: "Voltar",
      backAriaLabel: "Voltar para etapa anterior",
      exitLabel: "Sair",
      exitAriaLabel: "Sair da etapa",
      ...overrides,
    };
  }

  it("deve renderizar título, descrição, pergunta, tags e todas as opções", () => {
    const props = createProps();
    render(<SingleChoiceQuestionStep {...props} />);

    expect(screen.getByText("Título da Pergunta")).toBeDefined();
    expect(screen.getByText("Descrição de apoio")).toBeDefined();
    expect(screen.getByText("Qual o seu nível?")).toBeDefined();
    expect(screen.getByText("Governança de Dados")).toBeDefined();
    expect(screen.getByText("PRÉ-QUESTIONÁRIO")).toBeDefined();

    expect(screen.getByText("Opção 1")).toBeDefined();
    expect(screen.getByText("Opção 2")).toBeDefined();
    expect(screen.getByText("Opção 3")).toBeDefined();
  });

  it("deve aplicar roving tabindex: primeira opção com tabIndex 0 quando nenhuma está selecionada", () => {
    const props = createProps({ selectedOption: null });
    render(<SingleChoiceQuestionStep {...props} />);

    const radios = screen.getAllByRole("radio");
    expect(radios[0].getAttribute("tabindex")).toBe("0");
    expect(radios[1].getAttribute("tabindex")).toBe("-1");
    expect(radios[2].getAttribute("tabindex")).toBe("-1");
  });

  it("deve aplicar roving tabindex: apenas a opção selecionada tem tabIndex 0", () => {
    const props = createProps({ selectedOption: "opt-2" });
    render(<SingleChoiceQuestionStep {...props} />);

    const radios = screen.getAllByRole("radio");
    expect(radios[0].getAttribute("tabindex")).toBe("-1");
    expect(radios[1].getAttribute("tabindex")).toBe("0");
    expect(radios[2].getAttribute("tabindex")).toBe("-1");

    expect(radios[0].getAttribute("aria-checked")).toBe("false");
    expect(radios[1].getAttribute("aria-checked")).toBe("true");
    expect(radios[2].getAttribute("aria-checked")).toBe("false");
  });

  it("deve chamar onSelectOption ao clicar em uma opção", () => {
    const onSelectOption = vi.fn();
    const props = createProps({ onSelectOption });
    render(<SingleChoiceQuestionStep {...props} />);

    fireEvent.click(screen.getByText("Opção 2"));
    expect(onSelectOption).toHaveBeenCalledWith("opt-2");
  });

  it("deve chamar onSelectOption ao pressionar Enter ou Espaço em uma opção", () => {
    const onSelectOption = vi.fn();
    const props = createProps({ onSelectOption });
    render(<SingleChoiceQuestionStep {...props} />);

    const radios = screen.getAllByRole("radio");

    fireEvent.keyDown(radios[0], { key: "Enter" });
    expect(onSelectOption).toHaveBeenCalledWith("opt-1");

    fireEvent.keyDown(radios[1], { key: " " });
    expect(onSelectOption).toHaveBeenCalledWith("opt-2");
  });

  it("deve navegar entre opções com setas ArrowDown e ArrowUp", () => {
    const onSelectOption = vi.fn();
    const props = createProps({ onSelectOption });
    render(<SingleChoiceQuestionStep {...props} />);

    const radios = screen.getAllByRole("radio");

    // ArrowDown a partir da opção 0 deve selecionar a opção 1
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    expect(onSelectOption).toHaveBeenCalledWith("opt-2");

    // ArrowUp a partir da opção 0 deve fazer wrap para a última opção (opção 2)
    fireEvent.keyDown(radios[0], { key: "ArrowUp" });
    expect(onSelectOption).toHaveBeenCalledWith("opt-3");

    // ArrowRight também avança
    fireEvent.keyDown(radios[1], { key: "ArrowRight" });
    expect(onSelectOption).toHaveBeenCalledWith("opt-3");

    // ArrowLeft também volta
    fireEvent.keyDown(radios[2], { key: "ArrowLeft" });
    expect(onSelectOption).toHaveBeenCalledWith("opt-2");
  });

  it("botão Continuar deve estar desabilitado sem seleção e habilitado com seleção", () => {
    const onContinue = vi.fn();
    const { rerender } = render(
      <SingleChoiceQuestionStep {...createProps({ selectedOption: null, onContinue })} />
    );

    const continueButton = screen.getByText("Continuar").closest("button");
    expect(continueButton?.disabled).toBe(true);
    fireEvent.click(continueButton!);
    expect(onContinue).not.toHaveBeenCalled();

    rerender(
      <SingleChoiceQuestionStep
        {...createProps({ selectedOption: "opt-1", onContinue })}
      />
    );
    expect(continueButton?.disabled).toBe(false);
    fireEvent.click(continueButton!);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("botão Continuar deve exibir savingLabel quando isSubmitting for true", () => {
    const props = createProps({
      selectedOption: "opt-1",
      isSubmitting: true,
      savingLabel: "Salvando alterações...",
      continueLabel: "Continuar",
    });
    render(<SingleChoiceQuestionStep {...props} />);

    expect(screen.getByText("Salvando alterações...")).toBeDefined();
    expect(screen.queryByText("Continuar")).toBeNull();
  });

  it("botão Voltar não deve ser renderizado quando onBack for omitido", () => {
    const props = createProps({ onBack: undefined });
    render(<SingleChoiceQuestionStep {...props} />);

    expect(screen.queryByText("Voltar")).toBeNull();
  });

  it("botão Voltar deve ser renderizado e chamar onBack quando fornecido", () => {
    const onBack = vi.fn();
    const props = createProps({ onBack });
    render(<SingleChoiceQuestionStep {...props} />);

    const backButton = screen.getByLabelText("Voltar para etapa anterior");
    expect(backButton).toBeDefined();

    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onExit ao clicar no botão Sair do header", () => {
    const onExit = vi.fn();
    const props = createProps({ onExit });
    render(<SingleChoiceQuestionStep {...props} />);

    const exitButton = screen.getByLabelText("Sair da etapa");
    fireEvent.click(exitButton);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
