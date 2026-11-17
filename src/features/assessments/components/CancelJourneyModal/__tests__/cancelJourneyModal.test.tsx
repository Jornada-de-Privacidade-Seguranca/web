// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CancelJourneyModal } from "../index";

describe("CancelJourneyModal Component", () => {
  it("deve renderizar modal quando isOpen for true e disparar ações de cancelar e manter", () => {
    const onCancelMock = vi.fn();
    const onConfirmMock = vi.fn();

    render(
      <CancelJourneyModal
        isOpen={true}
        title="Cancelar jornada"
        description="Tem certeza de que deseja cancelar?"
        keepLabel="Manter jornada"
        confirmLabel="Cancelar jornada"
        confirmingLabel="Cancelando..."
        isConfirming={false}
        errorMessage={null}
        onCancel={onCancelMock}
        onConfirm={onConfirmMock}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Cancelar jornada" })
    ).toBeDefined();
    expect(
      screen.getByText("Tem certeza de que deseja cancelar?")
    ).toBeDefined();

    const keepBtn = screen.getByRole("button", { name: "Manter jornada" });
    fireEvent.click(keepBtn);
    expect(onCancelMock).toHaveBeenCalledTimes(1);

    const confirmBtn = screen.getByRole("button", {
      name: "Cancelar jornada",
    });
    fireEvent.click(confirmBtn);
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it("não deve renderizar nada quando isOpen for false", () => {
    const { container } = render(
      <CancelJourneyModal
        isOpen={false}
        title="Cancelar jornada"
        description="Tem certeza?"
        keepLabel="Manter jornada"
        confirmLabel="Cancelar jornada"
        confirmingLabel="Cancelando..."
        isConfirming={false}
        errorMessage={null}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("durante o cancelamento desabilita os dois botões, mostra o carregamento e não fecha", () => {
    const onCancelMock = vi.fn();
    const onConfirmMock = vi.fn();

    render(
      <CancelJourneyModal
        isOpen={true}
        title="Cancelar jornada"
        description="Tem certeza?"
        keepLabel="Manter jornada"
        confirmLabel="Cancelar jornada"
        confirmingLabel="Cancelando..."
        isConfirming={true}
        errorMessage={null}
        onCancel={onCancelMock}
        onConfirm={onConfirmMock}
      />
    );

    const keepBtn = screen.getByRole("button", { name: "Manter jornada" }) as HTMLButtonElement;
    const confirmBtn = screen.getByRole("button", { name: "Cancelando..." }) as HTMLButtonElement;
    expect(keepBtn.disabled).toBe(true);
    expect(confirmBtn.disabled).toBe(true);

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(screen.getByRole("presentation"));
    expect(onCancelMock).not.toHaveBeenCalled();
    expect(onConfirmMock).not.toHaveBeenCalled();
  });

  it("mostra a mensagem de erro na confirmação", () => {
    render(
      <CancelJourneyModal
        isOpen={true}
        title="Cancelar jornada"
        description="Tem certeza?"
        keepLabel="Manter jornada"
        confirmLabel="Cancelar jornada"
        confirmingLabel="Cancelando..."
        isConfirming={false}
        errorMessage="Não foi possível cancelar a jornada."
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("alert").textContent).toBe("Não foi possível cancelar a jornada.");
  });
});
