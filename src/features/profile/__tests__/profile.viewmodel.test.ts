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

const userProfile = {
  name: authenticatedUser.name,
  organization: "Instituto Exemplo",
  email: authenticatedUser.email,
  employeeCode: "E-21",
  department: "Privacidade",
};

const activity = {
  completedJourneys: 4,
  inProgressJourneys: 1,
  averageByDomain: { privacy: 80.4, security: 70, combined: null },
};

let queryClient: QueryClient;

function createWrapper() {
  queryClient = new QueryClient({
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

async function renderLoadedVM() {
  const hook = renderHook(() => useProfileVM(), { wrapper: createWrapper() });
  await waitFor(() => expect(hook.result.current.profile).toEqual(userProfile));
  return hook;
}

describe("useProfileVM", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: authenticatedUser,
      isAuthenticated: true,
      isLoading: false,
    });
    vi.spyOn(profileService, "getOwnProfile").mockResolvedValue(userProfile);
    vi.spyOn(profileService, "getProfileActivity").mockResolvedValue(activity);
  });

  it("carrega os dados do /me e o resumo de atividade do usuário", async () => {
    const { result } = await renderLoadedVM();

    expect(profileService.getProfileActivity).toHaveBeenCalledWith(21);
    expect(result.current.form.getValues("name")).toBe("Ana Souza");
    expect(result.current.initials).toBe("AS");

    await waitFor(() => expect(result.current.isActivityLoading).toBe(false));
    expect(result.current.metrics.map((metric) => metric.value)).toEqual([
      4,
      1,
      80,
      70,
      "profile.notAvailable",
    ]);
  });

  it("envia só os campos alterados e atualiza o cache e o usuário da barra lateral", async () => {
    const savedProfile = {
      ...userProfile,
      name: "Ana Silva",
      department: "Segurança",
    };
    const updateSpy = vi
      .spyOn(profileService, "updateOwnProfile")
      .mockResolvedValue(savedProfile);

    const { result } = await renderLoadedVM();

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("name", "  Ana Silva ");
      result.current.form.setValue("department", "Segurança");
      await result.current.handleSubmit();
    });

    await waitFor(() => expect(result.current.serverMessage?.variant).toBe("success"));
    expect(updateSpy).toHaveBeenCalledWith({ name: "Ana Silva", department: "Segurança" });
    expect(result.current.serverMessage?.title).toBe("profile.successTitle");
    expect(result.current.isEditing).toBe(false);
    expect(result.current.profile).toEqual(savedProfile);
    expect(queryClient.getQueryData(["profile", 21])).toEqual(savedProfile);
    expect(useAuthStore.getState().user).toMatchObject({
      id: 21,
      name: "Ana Silva",
      email: "ana@example.com",
      organization: "Instituto Exemplo",
    });
  });

  it("sai da edição sem chamar o backend quando nada mudou", async () => {
    const updateSpy = vi.spyOn(profileService, "updateOwnProfile");
    const { result } = await renderLoadedVM();

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("name", "Ana Souza ");
      await result.current.handleSubmit();
    });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(false);
    expect(result.current.serverMessage).toBeNull();
  });

  it("mostra a mensagem própria no campo quando o e-mail já é usado por outra conta", async () => {
    vi.spyOn(profileService, "updateOwnProfile").mockRejectedValue(
      new ApiRequestError("Ja existe uma conta cadastrada com este e-mail.", 409, "EMAIL_ALREADY_IN_USE", {
        email: ["Informe outro e-mail."],
      }),
    );
    const { result } = await renderLoadedVM();

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("email", "outra@example.com");
      await result.current.handleSubmit();
    });

    expect(result.current.form.getFieldState("email").error?.message).toBe(
      "profile.validation.emailInUse",
    );
    expect(result.current.serverMessage).toBeNull();
    expect(result.current.isEditing).toBe(true);
  });

  it("mostra em cada campo os erros de validação do backend", async () => {
    vi.spyOn(profileService, "updateOwnProfile").mockRejectedValue(
      new ApiRequestError("Validation error.", 422, "VALIDATION_ERROR", {
        name: ["Informe nome e sobrenome."],
        department: ["O setor deve ter no maximo 100 caracteres."],
      }),
    );
    const { result } = await renderLoadedVM();

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("name", "Ana Maria");
      result.current.form.setValue("department", "TI");
      await result.current.handleSubmit();
    });

    expect(result.current.form.getFieldState("name").error?.message).toBe(
      "Informe nome e sobrenome.",
    );
    expect(result.current.form.getFieldState("department").error?.message).toBe(
      "O setor deve ter no maximo 100 caracteres.",
    );
    expect(result.current.serverMessage).toBeNull();
  });

  it("discards unsaved edits when cancelling", async () => {
    const { result } = await renderLoadedVM();

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
    const updateSpy = vi.spyOn(profileService, "updateOwnProfile");
    const { result } = await renderLoadedVM();

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
    const updateSpy = vi.spyOn(profileService, "updateOwnProfile");
    const { result } = await renderLoadedVM();

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
    vi.spyOn(profileService, "updateOwnProfile").mockRejectedValue(
      new ApiRequestError("request failed", status),
    );
    const { result } = await renderLoadedVM();

    await act(async () => {
      result.current.handleEdit();
      result.current.form.setValue("department", "Outro setor");
      await result.current.handleSubmit();
    });

    expect(result.current.serverMessage).toEqual({
      title: "profile.errorTitle",
      description: message,
      variant: "destructive",
    });
  });

  it("mostra o erro só no resumo quando as métricas falham e tenta de novo", async () => {
    const activitySpy = vi
      .spyOn(profileService, "getProfileActivity")
      .mockRejectedValueOnce(new ApiRequestError("Erro", 500))
      .mockResolvedValue(activity);
    const { result } = await renderLoadedVM();

    await waitFor(() => expect(result.current.isActivityError).toBe(true));
    expect(result.current.isLoadError).toBe(false);

    act(() => result.current.handleRetryActivity());

    await waitFor(() => expect(result.current.isActivityError).toBe(false));
    expect(activitySpy).toHaveBeenCalledTimes(2);
  });

  it("mostra o erro de carregamento e tenta de novo os dados e o resumo", async () => {
    const profileSpy = vi
      .spyOn(profileService, "getOwnProfile")
      .mockRejectedValueOnce(new ApiRequestError("Erro", 500))
      .mockResolvedValue(userProfile);
    const { result } = renderHook(() => useProfileVM(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoadError).toBe(true));

    act(() => result.current.handleRetry());

    await waitFor(() => expect(result.current.profile).toEqual(userProfile));
    expect(profileSpy).toHaveBeenCalledTimes(2);
    expect(profileService.getProfileActivity).toHaveBeenCalledTimes(2);
  });

  it("does not persist invalid form values", async () => {
    const updateSpy = vi.spyOn(profileService, "updateOwnProfile");
    const { result } = await renderLoadedVM();

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
