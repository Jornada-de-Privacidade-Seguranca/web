// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { JourneyProfileSelectionDialog } from "../index";
import type { JourneyProfileSelectionDialogProps } from "../journeyProfileSelectionDialog.types";

function renderDialog(overrides?: Partial<JourneyProfileSelectionDialogProps>) {
  const props: JourneyProfileSelectionDialogProps = {
    isOpen: true,
    isConfirming: false,
    title: "Confirmar o perfil de jornada inicial",
    description: "O perfil de jornada Controlador será o seu perfil de jornada inicial.",
    warning: "Essa escolha não pode ser alterada depois que você começar.",
    error: null,
    cancelLabel: "Cancelar",
    confirmLabel: "Confirmar e iniciar",
    confirmingLabel: "Iniciando...",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  render(<JourneyProfileSelectionDialog {...props} />);
  return props;
}

describe("JourneyProfileSelectionDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("deve mostrar o perfil escolhido e o aviso de que a escolha é definitiva", () => {
    renderDialog();

    const dialog = screen.getByRole("alertdialog", { name: "Confirmar o perfil de jornada inicial" });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText(/Controlador será o seu perfil/)).toBeTruthy();
    expect(screen.getByText(/não pode ser alterada/)).toBeTruthy();
  });

  it("não deve renderizar nada fechado", () => {
    renderDialog({ isOpen: false });

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("deve confirmar e cancelar pelos botões", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar e iniciar" }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("deve cancelar com Esc", () => {
    const props = renderDialog();

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("deve exibir a falha como alerta", () => {
    renderDialog({ error: "Não foi possível salvar o perfil de jornada inicial." });

    expect(screen.getByRole("alert").textContent).toBe(
      "Não foi possível salvar o perfil de jornada inicial."
    );
  });

  it("enquanto confirma, deve bloquear os botões e não fechar com Esc", () => {
    const props = renderDialog({ isConfirming: true });

    const confirm = screen.getByRole("button", { name: "Iniciando..." }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    expect(confirm.getAttribute("aria-busy")).toBe("true");
    expect((screen.getByRole("button", { name: "Cancelar" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(props.onCancel).not.toHaveBeenCalled();
  });
});
