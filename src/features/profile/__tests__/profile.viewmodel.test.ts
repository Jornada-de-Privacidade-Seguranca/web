// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@services/httpClient";
import * as profileService from "@services/profileService";
import { useAuthStore } from "@features/auth/auth.store";
import { useProfileVM } from "../profile.viewmodel";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `profile.${key}`,
}));

vi.mock("@hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "dark",
    setThemeMode: vi.fn(),
  }),
}));

const authenticatedUser = {
  id: 21,
  name: "Ana Souza",
  email: "ana@example.com",
  role: "common_user" as const,
  profile: {
    role: "common_user" as const,
    label: "Colaborador",
    user_type_id: 1,
    profile_type_id: 1,
    profile_type_name: "Colaborador",
  },
  active_status: 1,
};

const profileData = {
  user: {
    name: authenticatedUser.name,
    organization: "Instituto Exemplo",
    email: authenticatedUser.email,
    employeeCode: "E-21",
    department: "Privacidade",
  },
  activity: {
    completedJourneys: 4,
    inProgressJourneys: 1,
    averageByDomain: { privacy: 80, security: 70, combined: 75 },
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useProfileVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: authenticatedUser,
      isAuthenticated: true,
      isLoading: false,
    });
    vi.spyOn(profileService, "getUserProfile").mockResolvedValue(profileData);
  });

  it("loads the authenticated profile, populates the form, and saves editable fields", async () => {
    const updateSpy = vi
      .spyOn(profileService, "updateUserProfile")
      .mockImplementation(async (_user, current, payload) => ({
        ...current,
        user: { ...current.user, ...payload },
      }));

    const { result } = renderHook(() => useProfileVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.profile).toEqual(profileData));
    expect(result.current.form.getValues("name")).toBe("Ana Souza");
    expect(result.current.initials).toBe("AS");

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("name", "Ana Silva");
      result.current.form.setValue("organization", "Instituto Atualizado");
      result.current.form.setValue("email", "ana.silva@example.com");
      result.current.form.setValue("department", "Segurança");
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result.current.serverMessage?.variant).toBe("success");
    });
    expect(updateSpy).toHaveBeenCalledWith(
      authenticatedUser,
      profileData,
      {
        name: "Ana Silva",
        organization: "Instituto Atualizado",
        email: "ana.silva@example.com",
        department: "Segurança",
      },
    );
    expect(result.current.serverMessage?.title).toBe("profile.successTitle");
    expect(result.current.isEditing).toBe(false);
  });

  it("discards unsaved edits when cancelling", async () => {
    const { result } = renderHook(() => useProfileVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.profile).toEqual(profileData));

    act(() => {
      result.current.handleEdit();
      result.current.form.setValue("name", "Nome temporário");
    });
    expect(result.current.isEditing).toBe(true);

    act(() => result.current.handleCancel());

    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.getValues("name")).toBe("Ana Souza");
  });

  it("rejects missing fields, invalid email, and changes to the immutable employee code", async () => {
    const updateSpy = vi.spyOn(profileService, "updateUserProfile");
    const { result } = renderHook(() => useProfileVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.profile).toEqual(profileData));

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("name", " ");
      result.current.form.setValue("email", "invalid-email");
      result.current.form.setValue("employeeCode", "CHANGED");
      await result.current.handleSubmit();
    });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState("name").error?.message).toBe(
      "profile.validation.nameRequired",
    );
    expect(result.current.form.getFieldState("email").error?.message).toBe(
      "profile.validation.emailInvalid",
    );
    expect(
      result.current.form.getFieldState("employeeCode").error?.message,
    ).toBe("profile.validation.employeeCodeImmutable");
  });

  it("validates first and last name, and maximum character lengths", async () => {
    const updateSpy = vi.spyOn(profileService, "updateUserProfile");
    const { result } = renderHook(() => useProfileVM(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.profile).toEqual(profileData));

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("name", "ApenasUmNome");
      result.current.form.setValue("organization", "A".repeat(101));
      result.current.form.setValue("department", "B".repeat(101));
      await result.current.handleSubmit();
    });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState("name").error?.message).toBe(
      "profile.validation.nameLastName",
    );
    expect(result.current.form.getFieldState("organization").error?.message).toBe(
      "profile.validation.organizationMaxLength",
    );
    expect(result.current.form.getFieldState("department").error?.message).toBe(
      "profile.validation.departmentMaxLength",
    );
  });

  it.each([
    [401, "profile.unauthorizedError"],
    [500, "profile.serverError"],
  ])("returns destructive feedback for HTTP %i", async (status, message) => {
    vi.spyOn(profileService, "updateUserProfile").mockRejectedValue(
      new ApiRequestError("request failed", status),
    );
    const { result } = renderHook(() => useProfileVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.profile).toEqual(profileData));

    await act(async () => {
      result.current.handleEdit();
      await result.current.handleSubmit();
    });

    expect(result.current.serverMessage).toEqual({
      title: "profile.errorTitle",
      description: message,
      variant: "destructive",
    });
  });

  it("does not persist invalid form values", async () => {
    const updateSpy = vi.spyOn(profileService, "updateUserProfile");
    const { result } = renderHook(() => useProfileVM(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.profile).toEqual(profileData));

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("department", "");
      await result.current.handleSubmit();
    });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState("department").error?.message).toBe(
      "profile.validation.departmentRequired",
    );
  });
});
