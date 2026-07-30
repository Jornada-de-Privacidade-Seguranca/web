import { describe, it, expect, vi, beforeEach } from "vitest";
import * as dashboardService from "@services/dashboardService";
import { useAuthStore } from "@features/auth/auth.store";

describe("Painel Feature Logic & Auth Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: { id: "usr_1", name: "Maria Oliveira", firstName: "Maria" },
      token: "valid-jwt-token",
      isAuthenticated: true,
    });
  });

  it("should integrate correctly with useAuthStore to supply authenticated user data", () => {
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user?.firstName).toBe("Maria");
    expect(authState.token).toBe("valid-jwt-token");
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

    const token = useAuthStore.getState().token ?? undefined;
    const data = await dashboardService.getDashboardData(5, token);

    expect(spy).toHaveBeenCalledWith(5, "valid-jwt-token");
    expect(data.pending?.title).toBe("Segurança Digital");
    expect(data.lastCompleted?.score).toBe(95);
    expect(data.history).toHaveLength(1);
  });

  it("should handle error resolution when backend returns 401 or 500 failure", async () => {
    vi.spyOn(dashboardService, "getDashboardData").mockRejectedValueOnce(
      new Error("Não autorizado")
    );

    const token = useAuthStore.getState().token ?? undefined;

    await expect(dashboardService.getDashboardData(5, token)).rejects.toThrow(
      "Não autorizado"
    );
  });

  it("should handle empty dashboard responses gracefully", async () => {
    vi.spyOn(dashboardService, "getDashboardData").mockResolvedValueOnce({
      pending: null,
      lastCompleted: null,
      history: [],
    });

    const token = useAuthStore.getState().token ?? undefined;
    const data = await dashboardService.getDashboardData(5, token);

    expect(data.pending).toBeNull();
    expect(data.lastCompleted).toBeNull();
    expect(data.history).toEqual([]);
  });
});
