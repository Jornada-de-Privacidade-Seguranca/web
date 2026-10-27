// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DomainBadge } from "../index";

describe("DomainBadge", () => {
  it("deve exibir o domínio com o texto acessível", () => {
    render(<DomainBadge label="Privacidade" srPrefix="Domínio" />);

    expect(screen.getByTestId("domain-badge").textContent).toBe("Domínio: Privacidade");
  });

  it("deve usar estilo neutro, só com contorno", () => {
    render(<DomainBadge label="Segurança da Informação" />);

    const className = screen.getByTestId("domain-badge").className;
    expect(className).toContain("border-border");
    expect(className).not.toMatch(/\bbg-/);
  });

  it("não deve ser exibido quando o domínio vier nulo", () => {
    render(<DomainBadge label={null} srPrefix="Domínio" />);

    expect(screen.queryByTestId("domain-badge")).toBeNull();
  });
});
