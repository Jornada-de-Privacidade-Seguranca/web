// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricsGrid } from "../index";
import type { MetricsGridItem } from "../metricsGrid.types";

const mockItems: MetricsGridItem[] = [
  { id: "completed-journeys", label: "Jornadas concluídas", value: 3 },
  { id: "in-progress-journeys", label: "Jornadas em andamento", value: 1 },
  { id: "privacy-average", label: "Média das notas · Privacidade", value: "85/100" },
];

describe("MetricsGrid Component", () => {
  it("renders metric items with accessible label and value association", () => {
    render(<MetricsGrid items={mockItems} />);

    for (const item of mockItems) {
      const labelHeading = screen.getByText(item.label);
      expect(labelHeading).toBeTruthy();
      expect(labelHeading.getAttribute("id")).toBe(`metric-${item.id}-label`);

      const valueElement = screen.getByText(String(item.value));
      expect(valueElement).toBeTruthy();
      expect(valueElement.getAttribute("aria-labelledby")).toBe(
        `metric-${item.id}-label`,
      );
    }
  });

  it("renders loading skeleton with aria-busy and aria-label", () => {
    render(
      <MetricsGrid
        items={mockItems}
        isLoading={true}
        loadingLabel="Carregando estatísticas..."
      />,
    );

    const loadingContainer = screen.getByLabelText("Carregando estatísticas...");
    expect(loadingContainer).toBeTruthy();
    expect(loadingContainer.getAttribute("aria-busy")).toBe("true");
  });

  it("applies custom className", () => {
    const { container } = render(
      <MetricsGrid items={mockItems} className="custom-grid-class" />,
    );

    expect((container.firstChild as HTMLElement)?.className).toContain(
      "custom-grid-class",
    );
  });
});
