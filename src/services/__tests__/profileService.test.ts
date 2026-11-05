import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axiosInstance, clearCsrfToken } from "../httpClient";
import { getUserProfile, updateUserProfile } from "../profileService";

function mockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as AxiosResponse["config"],
  };
}

const user = {
  id: 8,
  name: "Joana Lima",
  email: "joana@example.com",
  role: "common_user" as const,
  profile: {
    role: "common_user" as const,
    label: "Colaboradora",
    user_type_id: 1,
    profile_type_id: 1,
    profile_type_name: "Colaboradora",
  },
  active_status: 1,
};

const data = {
  user: {
    name: "Joana Lima",
    organization: "Empresa Exemplo",
    email: "joana@example.com",
    employeeCode: "8-A",
    department: "Segurança",
  },
  activity: {
    completedJourneys: 2,
    inProgressJourneys: 1,
    averageByDomain: { privacy: 70, security: 80, combined: 75 },
  },
};

describe("profileService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearCsrfToken();
  });

  it("unwraps the standard API response envelope for profile GET", async () => {
    const request = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(mockResponse({ success: true, data }));

    await expect(getUserProfile(user)).resolves.toEqual(data);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/profile" }),
    );
  });

  it("updates with editable values only and unwraps the response", async () => {
    const request = vi
      .spyOn(axiosInstance, "request")
      .mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: { csrf_token: "test-csrf-token" },
        }),
      )
      .mockResolvedValueOnce(mockResponse({ success: true, data }));

    await expect(
      updateUserProfile(user, data, {
        name: "Joana Souza",
        organization: "Nova Empresa",
        email: "joana.souza@example.com",
        department: "Privacidade",
      }),
    ).resolves.toEqual(data);
    expect(request).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        url: "/profile",
        method: "put",
        data: {
          name: "Joana Souza",
          organization: "Nova Empresa",
          email: "joana.souza@example.com",
          department: "Privacidade",
        },
      }),
    );
  });
});
