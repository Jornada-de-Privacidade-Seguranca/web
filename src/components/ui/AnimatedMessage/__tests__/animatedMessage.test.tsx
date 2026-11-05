// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { AnimatedMessage } from "../index";

const notice = {
  title: "Sessão expirada",
  description: "Sua sessão expirou. Entre novamente para continuar.",
  variant: "warning" as const,
};

function getWrapper(): HTMLElement {
  return screen.getByRole("status").closest("[data-state]") as HTMLElement;
}

describe("AnimatedMessage", () => {
  afterEach(() => {
    cleanup();
  });

  it("não deve renderizar nada sem mensagem", () => {
    const { container } = render(<AnimatedMessage message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve exibir a mensagem aberta, com a animação de entrada", () => {
    render(<AnimatedMessage message={notice} />);

    expect(screen.getByText("Sessão expirada")).toBeTruthy();
    expect(getWrapper().getAttribute("data-state")).toBe("open");
    expect(screen.getByRole("status").parentElement?.className).toContain("animate-in");
  });

  it("deve manter a mensagem na tela durante a saída e removê-la ao fim da transição", () => {
    const { rerender } = render(<AnimatedMessage message={notice} />);

    rerender(<AnimatedMessage message={null} />);

    const wrapper = getWrapper();
    expect(wrapper.getAttribute("data-state")).toBe("closed");
    expect(wrapper.hasAttribute("inert")).toBe(true);
    expect(screen.getByText("Sessão expirada")).toBeTruthy();

    fireEvent.transitionEnd(wrapper);

    expect(screen.queryByText("Sessão expirada")).toBeNull();
  });

  it("deve trocar o conteúdo quando chegar uma mensagem nova", () => {
    const { rerender } = render(<AnimatedMessage message={notice} />);

    rerender(
      <AnimatedMessage
        message={{ title: "Não foi possível entrar", description: "Usuário e/ou senha inválidos.", variant: "destructive" }}
      />
    );

    expect(screen.getByRole("alert").textContent).toContain("Usuário e/ou senha inválidos.");
    expect(screen.queryByText("Sessão expirada")).toBeNull();
  });

  it("deve chamar onClose ao fechar", () => {
    const onClose = vi.fn();
    render(<AnimatedMessage message={notice} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
