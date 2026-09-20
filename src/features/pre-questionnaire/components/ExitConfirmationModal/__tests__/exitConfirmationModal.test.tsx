// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ExitConfirmationModal } from "../index";
import type { ExitConfirmationModalProps } from "../exitConfirmationModal.types";

describe("ExitConfirmationModal", () => {
  function createProps(
    overrides?: Partial<ExitConfirmationModalProps>
  ): ExitConfirmationModalProps {
    return {
      isOpen: true,
      title: "Deseja sair do pré-questionário?",
      description: "Suas respostas anteriores já foram salvas.",
      cancelLabel: "Continuar respondendo",
      confirmLabel: "Sair da jornada",
      onCancel: vi.fn(),
      onConfirm: vi.fn(),
      ...overrides,
    };
  }

  it("não deve renderizar nada quando isOpen for false", () => {
    const props = createProps({ isOpen: false });
    const { container } = render(<ExitConfirmationModal {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar título, descrição, botões e focar o botão cancelar ao abrir", () => {
    const props = createProps({ isOpen: true });
    render(<ExitConfirmationModal {...props} />);

    expect(screen.getByText("Deseja sair do pré-questionário?")).toBeDefined();
    expect(screen.getByText("Suas respostas anteriores já foram salvas.")).toBeDefined();

    const cancelButton = screen.getByText("Continuar respondendo");
    const confirmButton = screen.getByText("Sair da jornada");

    expect(cancelButton).toBeDefined();
    expect(confirmButton).toBeDefined();
    expect(document.activeElement).toBe(cancelButton);
  });

  it("deve chamar onCancel ao pressionar Escape", () => {
    const onCancel = vi.fn();
    render(<ExitConfirmationModal {...createProps({ onCancel })} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onCancel ao clicar no backdrop", () => {
    const onCancel = vi.fn();
    render(<ExitConfirmationModal {...createProps({ onCancel })} />);

    const backdrop = screen.getByRole("presentation");
    fireEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("não deve chamar onCancel ao clicar dentro do card do diálogo", () => {
    const onCancel = vi.fn();
    render(<ExitConfirmationModal {...createProps({ onCancel })} />);

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("deve chamar onConfirm ao clicar no botão de confirmar", () => {
    const onConfirm = vi.fn();
    render(<ExitConfirmationModal {...createProps({ onConfirm })} />);

    const confirmButton = screen.getByText("Sair da jornada");
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onCancel ao clicar no botão de cancelar", () => {
    const onCancel = vi.fn();
    render(<ExitConfirmationModal {...createProps({ onCancel })} />);

    const cancelButton = screen.getByText("Continuar respondendo");
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("deve prender o foco dentro do modal ao pressionar Tab e Shift+Tab", () => {
    render(<ExitConfirmationModal {...createProps()} />);

    const cancelButton = screen.getByText("Continuar respondendo");
    const confirmButton = screen.getByText("Sair da jornada");

    // Foco inicial está no botão Cancelar
    expect(document.activeElement).toBe(cancelButton);

    // Tab no primeiro elemento (Cancelar) não é o último, o foco se move normalmente no DOM
    confirmButton.focus();
    expect(document.activeElement).toBe(confirmButton);

    // Tab no último elemento (Confirmar) deve ciclar para o primeiro (Cancelar)
    fireEvent.keyDown(window, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(cancelButton);

    // Shift+Tab no primeiro elemento (Cancelar) deve ciclar para o último (Confirmar)
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(confirmButton);
  });
});
