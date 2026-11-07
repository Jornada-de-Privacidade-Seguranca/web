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
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
