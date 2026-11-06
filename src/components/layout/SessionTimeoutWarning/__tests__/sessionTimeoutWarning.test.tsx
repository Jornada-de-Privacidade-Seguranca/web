// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import { SessionTimeoutWarning } from "../index";
import type { SessionTimeoutWarningViewModelReturn } from "../sessionTimeoutWarning.types";

const vmMock = vi.fn<() => SessionTimeoutWarningViewModelReturn>();

vi.mock("../sessionTimeoutWarning.viewmodel", () => ({
  useSessionTimeoutWarningVM: () => vmMock(),
}));

function buildVM(
  overrides: Partial<SessionTimeoutWarningViewModelReturn> = {}
): SessionTimeoutWarningViewModelReturn {
  return {
    isOpen: true,
    isRenewing: false,
    labels: {
      title: "Sua sessão está quase expirando",
      countdown: "Sua sessão vai expirar em 04:59.",
      announcement: "Sua sessão vai expirar em 5 minutos.",
      hint: "Para não perder o que você está fazendo, continue conectado.",
      renew: "Continuar conectado",
      logout: "Sair",
    },
    handleRenew: vi.fn(),
    handleLogout: vi.fn(),
    handleEscapeKeyDown: (event: KeyboardEvent) => event.preventDefault(),
    ...overrides,
  };
}

describe("SessionTimeoutWarning", () => {
  beforeEach(() => {
    vmMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("não deve mostrar nada fora da janela do aviso", () => {
    vmMock.mockReturnValue(buildVM({ isOpen: false }));
    render(<SessionTimeoutWarning />);

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("deve mostrar o aviso como alerta modal, com o foco em continuar conectado", async () => {
    vmMock.mockReturnValue(buildVM());
    render(<SessionTimeoutWarning />);

    const dialog = screen.getByRole("alertdialog", { name: "Sua sessão está quase expirando" });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Continuar conectado" })
      )
    );
  });

  it("deve esconder a contagem em segundos do leitor de tela e anunciar os minutos", () => {
    vmMock.mockReturnValue(buildVM());
    render(<SessionTimeoutWarning />);

    const countdown = screen.getByText("Sua sessão vai expirar em 04:59.");
    expect(countdown.getAttribute("aria-hidden")).toBe("true");
    const announcement = screen.getByText("Sua sessão vai expirar em 5 minutos.");
    expect(announcement.getAttribute("aria-live")).toBe("polite");
  });

  it("deve chamar as ações dos botões", () => {
    const vm = buildVM();
    vmMock.mockReturnValue(vm);
    render(<SessionTimeoutWarning />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar conectado" }));
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    expect(vm.handleRenew).toHaveBeenCalledTimes(1);
    expect(vm.handleLogout).toHaveBeenCalledTimes(1);
  });

  it("não deve fechar com Esc", () => {
    vmMock.mockReturnValue(buildVM());
    render(<SessionTimeoutWarning />);

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });

    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it("deve mostrar o erro da renovação como alerta", () => {
    vmMock.mockReturnValue(
      buildVM({
        labels: { ...buildVM().labels, renewError: "Não foi possível renovar a sessão." },
      })
    );
    render(<SessionTimeoutWarning />);

    expect(screen.getByRole("alert").textContent).toBe("Não foi possível renovar a sessão.");
  });
});
