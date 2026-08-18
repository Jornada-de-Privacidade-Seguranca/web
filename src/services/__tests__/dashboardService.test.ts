import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import {
  getPendingAssessment,
  getLastCompletedAssessment,
  getRecentHistory,
  getDashboardData,
} from "../dashboardService";
import { axiosInstance } from "../httpClient";

function mockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as AxiosResponse["config"],
  };
}

function mockAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      data,
      status,
      statusText: "",
      headers: {},
      config: {} as AxiosResponse["config"],
    } as AxiosResponse
  );
}

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

      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: mockPending }));

      const result = await getPendingAssessment();
      expect(result).toEqual(mockPending);
      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ url: "/dashboard/pending" })
      );
    });

    it("should return null when response data is null", async () => {
      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({ success: true, data: null })
      );

      const result = await getPendingAssessment();
      expect(result).toBeNull();
    });

    it("should throw error with API message when success is false or HTTP fails", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(401, {
          success: false,
          message: "Sessão expirada. Faça login novamente.",
        })
      );

      await expect(getPendingAssessment()).rejects.toThrow(
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

      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({ success: true, data: mockCompleted })
      );

      const result = await getLastCompletedAssessment();
      expect(result).toEqual(mockCompleted);
    });

    it("should handle error status 500", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(500, { message: "Erro interno no servidor." })
      );

      await expect(getLastCompletedAssessment()).rejects.toThrow(
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

      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: mockHistory }));

      const result = await getRecentHistory(5);
      expect(result).toEqual(mockHistory);
      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/dashboard/history",
          params: { limit: 5 },
        })
      );
    });

    it("should return empty array if data is empty or empty array", async () => {
      vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({ success: true, data: [] })
      );

      const result = await getRecentHistory(5);
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

      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: mockPending }))
        .mockResolvedValueOnce(mockResponse({ success: true, data: null }))
        .mockResolvedValueOnce(mockResponse({ success: true, data: [] }));

      const dashboard = await getDashboardData(5);
      expect(dashboard).toEqual({
        pending: mockPending,
        lastCompleted: null,
        history: [],
      });
      expect(requestSpy).toHaveBeenCalledTimes(3);
    });
  });
});
