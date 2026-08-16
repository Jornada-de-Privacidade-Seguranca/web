import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPendingAssessments,
  getCatalogAssessments,
} from "../AssessmentsService";

describe("AssessmentsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar jornadas pendentes desembrulhando a propriedade 'data'", async () => {
    const mockApiResponse = {
      success: true,
      data: {
        items: [
          {
            id: "j1",
            title: "Segurança Digital Básica",
            description: "Aprenda conceitos fundamentais",
            totalQuestions: 10,
            estimatedMinutes: 15,
            status: "not_started",
          },
        ],
        total: 1,
        page: 1,
        limit: 6,
        totalPages: 1,
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const result = await getPendingAssessments({ page: 1, limit: 6 }, "fake-token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/assessments/pending?page=1&limit=6"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Segurança Digital Básica");
  });

  it("deve buscar o catálogo de jornadas aplicando o filtro de busca", async () => {
    const mockApiResponse = {
      success: true,
      data: {
        items: [
          {
            id: "j2",
            title: "LGPD na Prática",
            description: "Entenda a lei geral de proteção de dados",
            totalQuestions: 8,
            estimatedMinutes: 12,
            status: "completed",
          },
        ],
        total: 1,
        page: 1,
        limit: 6,
        totalPages: 1,
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const result = await getCatalogAssessments(
      { page: 1, limit: 6, search: "LGPD" },
      "fake-token"
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/assessments?page=1&limit=6&search=LGPD"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
    expect(result.items[0].title).toBe("LGPD na Prática");
  });

  it("deve lançar erro quando a resposta HTTP for status de erro (ex: 500)", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Erro interno no servidor" }),
    } as Response);

    await expect(getPendingAssessments({}, "token")).rejects.toThrow(
      "Erro interno no servidor"
    );
  });
});
