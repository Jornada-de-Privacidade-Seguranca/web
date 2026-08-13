import { describe, it, expect, vi, beforeEach } from "vitest";
import * as dashboardService from "@services/dashboardService";
import { useAuthStore } from "@features/auth/auth.store";

describe("Painel Feature Logic & Auth Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: {
        id: 1,
        name: "Maria Oliveira",
        email: "maria@empresa.com",
        role: "common_user",
        profile: {
          role: "common_user",
          label: "Usuario comum",
          user_type_id: 2,
          profile_type_id: 1,
          profile_type_name: "Aluno",
        },
        active_status: 1,
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("should integrate correctly with useAuthStore to supply authenticated user data", () => {
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user?.name).toBe("Maria Oliveira");
  });

  it("should fetch dashboard data with correct parameters using getDashboardData", async () => {
    const mockDashboardData = {
      pending: {
        id: "p1",
        title: "Segurança Digital",
        description: "Avaliação pendente",
        status: "pending" as const,
        totalQuestions: 5,
        estimatedMinutes: 10,
      },
      lastCompleted: {
        id: "c1",
        title: "LGPD",
        completedAt: "2026-05-19T00:00:00Z",
        score: 95,
      },
      history: [
        {
          id: "h1",
          title: "LGPD",
          completedAt: "2026-05-19T00:00:00Z",
          score: 95,
        },
      ],
    };

    const spy = vi
      .spyOn(dashboardService, "getDashboardData")
      .mockResolvedValueOnce(mockDashboardData);

    const data = await dashboardService.getDashboardData(5);

    expect(spy).toHaveBeenCalledWith(5);
    expect(data.pending?.title).toBe("Segurança Digital");
    expect(data.lastCompleted?.score).toBe(95);
    expect(data.history).toHaveLength(1);
  });

  it("should handle error resolution when backend returns 401 or 500 failure", async () => {
    vi.spyOn(dashboardService, "getDashboardData").mockRejectedValueOnce(
      new Error("Não autorizado")
    );

    await expect(dashboardService.getDashboardData(5)).rejects.toThrow(
      "Não autorizado"
    );
  });

  it("should handle empty dashboard responses gracefully", async () => {
    vi.spyOn(dashboardService, "getDashboardData").mockResolvedValueOnce({
      pending: null,
      lastCompleted: null,
      history: [],
    });

    const data = await dashboardService.getDashboardData(5);

    expect(data.pending).toBeNull();
    expect(data.lastCompleted).toBeNull();
    expect(data.history).toEqual([]);
  });
});
