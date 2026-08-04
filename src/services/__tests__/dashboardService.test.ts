import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPendingAssessment,
  getLastCompletedAssessment,
  getRecentHistory,
  getDashboardData,
} from "../dashboardService";

describe("dashboardService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getPendingAssessment", () => {
    it("should unwrap envelope response data correctly on success", async () => {
      const mockPending = {
        id: "eval-1",
        title: "Segurança Digital",
        description: "Avaliação de práticas",
        status: "pending" as const,
        totalQuestions: 5,
        estimatedMinutes: 10,
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPending,
        }),
      } as Response);

      const result = await getPendingAssessment("mock-token");
      expect(result).toEqual(mockPending);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/pending"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });

    it("should return null when response data is null", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: null,
        }),
      } as Response);

      const result = await getPendingAssessment();
      expect(result).toBeNull();
    });

    it("should throw error with API message when success is false or HTTP fails", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: "Sessão expirada. Faça login novamente.",
        }),
      } as Response);

      await expect(getPendingAssessment("invalid-token")).rejects.toThrow(
        "Sessão expirada. Faça login novamente."
      );
    });
  });

  describe("getLastCompletedAssessment", () => {
    it("should unwrap last completed assessment data", async () => {
      const mockCompleted = {
        id: "eval-completed-1",
        title: "Privacidade de Dados",
        completedAt: "2026-05-19T00:00:00Z",
        score: 85,
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCompleted,
        }),
      } as Response);

      const result = await getLastCompletedAssessment("token");
      expect(result).toEqual(mockCompleted);
    });

    it("should handle error status 500", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          message: "Erro interno no servidor.",
        }),
      } as Response);

      await expect(getLastCompletedAssessment("token")).rejects.toThrow(
        "Erro interno no servidor."
      );
    });
  });

  describe("getRecentHistory", () => {
    it("should return history array when call succeeds", async () => {
      const mockHistory = [
        {
          id: "hist-1",
          title: "LGPD Básico",
          completedAt: "2026-05-19T00:00:00Z",
          score: 90,
        },
      ];

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockHistory,
        }),
      } as Response);

      const result = await getRecentHistory(5, "token");
      expect(result).toEqual(mockHistory);
    });

    it("should return empty array if data is empty or empty array", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      } as Response);

      const result = await getRecentHistory(5, "token");
      expect(result).toEqual([]);
    });
  });

  describe("getDashboardData", () => {
    it("should fetch pending, lastCompleted and history in parallel via Promise.all", async () => {
      const mockPending = {
        id: "p1",
        title: "Test",
        description: "Desc",
        status: "pending" as const,
        totalQuestions: 3,
        estimatedMinutes: 5,
      };

      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockPending }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: null }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        } as Response);

      const dashboard = await getDashboardData(5, "token");
      expect(dashboard).toEqual({
        pending: mockPending,
        lastCompleted: null,
        history: [],
      });
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });
});
