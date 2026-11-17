import { describe, it, expect, vi } from "vitest";
import type { ReactElement } from "react";

vi.mock("@features/journey-result", () => ({ default: () => null }));

import AdminResultadoUsuarioPage from "../[id]/page";

describe("AdminResultadoUsuarioPage (/admin/resultados/[id])", () => {
  it("deve abrir o resultado na visão do admin com a query string da listagem", async () => {
    const element = (await AdminResultadoUsuarioPage({
      params: Promise.resolve({ locale: "pt", id: "42" }),
      searchParams: Promise.resolve({ department: "TI", domains: ["privacy", "joint"], page: "2" }),
    })) as ReactElement<Record<string, unknown>>;

    expect(element.props).toEqual({
      journeyId: "42",
      variant: "admin",
      listQuery: "department=TI&domains=privacy&domains=joint&page=2",
    });
  });
});
