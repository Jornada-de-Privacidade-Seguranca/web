import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMetrics, getResultsList } from "../ResultsService";

describe("ResultsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve buscar as métricas de KPI desembrulhando a propriedade 'data'", async () => {
    const mockApiResponse = {
      success: true,
      data: {
        totalCompleted: 15,
        averageScore: 76,
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const result = await getMetrics("fake-token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/results/metrics"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
    expect(result.totalCompleted).toBe(15);
    expect(result.averageScore).toBe(76);
  });

  it("deve buscar a lista de resultados paginada aplicando filtro de busca", async () => {
    const mockApiResponse = {
      success: true,
      data: {
        items: [
          {
            id: "r1",
            title: "Fundamentos de LGPD",
            description: "Avalie seu domínio sobre princípios de proteção de dados",
            score: 78,
            completedAt: "2026-05-20T00:00:00Z",
            questionsCount: 5,
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

    const result = await getResultsList(
      { page: 1, limit: 6, search: "LGPD" },
      "fake-token"
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/results?page=1&limit=6&search=LGPD"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
    expect(result.items[0].title).toBe("Fundamentos de LGPD");
  });

  it("deve lançar erro quando a API retornar status 500", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Erro de servidor ao buscar métricas" }),
    } as Response);

    await expect(getMetrics("token")).rejects.toThrow(
      "Erro de servidor ao buscar métricas"
    );
  });
});
