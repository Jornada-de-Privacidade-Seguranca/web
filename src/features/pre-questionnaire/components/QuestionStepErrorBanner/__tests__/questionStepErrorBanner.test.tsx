// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QuestionStepErrorBanner } from "../index";

vi.mock("@shared/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("QuestionStepErrorBanner", () => {
  it("não deve renderizar nada quando não houver mensagem", () => {
    const { container } = render(
      <QuestionStepErrorBanner
        message={null}
        retryLabel="Tentar novamente"
        onRetry={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("deve exibir a mensagem com role alert e chamar onRetry ao clicar em tentar novamente", () => {
    const onRetry = vi.fn();
    render(
      <QuestionStepErrorBanner
        message="Falha ao carregar."
        retryLabel="Tentar novamente"
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole("alert").textContent).toContain("Falha ao carregar.");

    fireEvent.click(screen.getByText("Tentar novamente"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("deve exibir um link no lugar da nova tentativa quando informado", () => {
    render(
      <QuestionStepErrorBanner
        message="Existem etapas obrigatorias pendentes."
        linkLabel="Ver resumo da jornada"
        linkHref="/jornada/78"
      />
    );

    expect(screen.getByRole("link", { name: "Ver resumo da jornada" }).getAttribute("href")).toBe(
      "/jornada/78"
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});
