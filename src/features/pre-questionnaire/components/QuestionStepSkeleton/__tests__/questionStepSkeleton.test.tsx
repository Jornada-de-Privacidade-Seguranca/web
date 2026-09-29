// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QuestionStepSkeleton } from "../index";

describe("QuestionStepSkeleton", () => {
  it("deve expor o status de carregamento acessível com o rótulo informado", () => {
    render(
      <QuestionStepSkeleton
        loadingLabel="Carregando pergunta..."
        optionCount={3}
        testId="step-skeleton"
      />
    );

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.getAttribute("aria-label")).toBe("Carregando pergunta...");
    expect(screen.getByTestId("step-skeleton")).toBe(status);
  });

  it("deve renderizar um placeholder para cada opção", () => {
    const { container } = render(
      <QuestionStepSkeleton loadingLabel="Carregando..." optionCount={5} />
    );

    expect(container.querySelectorAll(".h-14")).toHaveLength(5);
  });
});
