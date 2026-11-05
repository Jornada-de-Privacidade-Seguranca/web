// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import { SessionExpiredDialog } from "../index";

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

describe("SessionExpiredDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("deve mostrar o aviso como alerta modal, com o foco no botão de login", async () => {
    render(<SessionExpiredDialog onConfirm={vi.fn()} />);

    const dialog = screen.getByRole("alertdialog", { name: "sessionExpired.title" });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText("sessionExpired.description")).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "sessionExpired.action" })
      )
    );
  });

  it("não deve fechar com Esc", () => {
    const onConfirm = vi.fn();
    render(<SessionExpiredDialog onConfirm={onConfirm} />);

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });

    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("deve ter só o botão que leva ao login", () => {
    const onConfirm = vi.fn();
    render(<SessionExpiredDialog onConfirm={onConfirm} />);

    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "sessionExpired.action" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
