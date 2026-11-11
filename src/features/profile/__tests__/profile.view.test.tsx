// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProfileViewModelReturn } from "../profile.types";
import * as viewModelModule from "../profile.viewmodel";
import { ProfileView } from "../index";

const { changeLocaleSpy } = vi.hoisted(() => ({
  changeLocaleSpy: vi.fn(),
}));

vi.mock("@/components/layout/PageShell", () => ({
  PageShell: ({
    children,
    title,
  }: {
    children: ReactNode;
    title: string;
  }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

vi.mock("@/hooks/useLang", () => ({
  useLang: () => ({
    locale: "pt",
    locales: ["pt", "en"],
    changeLocale: changeLocaleSpy,
  }),
}));

const labels = {
  title: "Meu perfil",
  subtitle: "Atualize seus dados",
  editProfile: "Editar perfil",
  personalData: "Dados pessoais",
  fullName: "Nome completo",
  organization: "Órgão/empresa",
  email: "E-mail",
  employeeCode: "Código de funcionário",
  department: "Setor",
  employeeCodeHelp: "O código não pode ser alterado.",
  notProvided: "Não informado",
  save: "Salvar",
  cancel: "Cancelar",
  activityTitle: "Atividade no sistema",
  completedJourneys: "Jornadas concluídas",
  inProgressJourneys: "Jornadas em andamento",
  privacyAverage: "Média · Privacidade",
  securityAverage: "Média · Segurança",
  combinedAverage: "Média · Conjunta",
  loading: "Carregando perfil",
  loadErrorTitle: "Erro ao carregar",
  loadErrorDescription: "Tente novamente.",
  retry: "Tentar novamente",
  activityLoadError: "Erro ao carregar a atividade",
  notAvailable: "—",
  successTitle: "Perfil atualizado",
  successDescription: "Dados salvos.",
  errorTitle: "Erro ao salvar",
  unauthorizedError: "Sessão expirada.",
  serverError: "Erro de servidor.",
  genericError: "Erro inesperado.",
  closeMessage: "Fechar mensagem",
  validation: {
    nameRequired: "Nome obrigatório.",
    nameLastName: "Informe nome e sobrenome.",
    nameMaxLength: "Máximo 50 caracteres.",
    organizationRequired: "Órgão obrigatório.",
    organizationMaxLength: "Máximo 100 caracteres.",
    emailRequired: "E-mail obrigatório.",
    emailInvalid: "E-mail inválido.",
    emailMaxLength: "Máximo 100 caracteres.",
    departmentRequired: "Setor obrigatório.",
    departmentMaxLength: "Máximo 100 caracteres.",
    employeeCodeImmutable: "Código não editável.",
    emailInUse: "E-mail já usado.",
  },
  preferencesTitle: "Preferências",
  language: "Idioma",
  theme: "Tema",
  themeLight: "Claro",
  themeDark: "Escuro",
  themeHighContrast: "Alto contraste",
  themeHighContrastUnavailable: "Disponível futuramente.",
};

function makeViewModel(
  overrides: Partial<ProfileViewModelReturn> = {},
): ProfileViewModelReturn {
  const register = (name: string) => ({
    name,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  });
  const form = {
    register,
    formState: { errors: {} },
  } as unknown as ProfileViewModelReturn["form"];

  return {
    profile: {
      name: "Ana Souza",
      organization: "Instituto Exemplo",
      email: "ana@example.com",
      employeeCode: "E-21",
      department: "Privacidade",
    },
    initials: "AS",
    form,
    isLoading: false,
    isLoadError: false,
    isActivityLoading: false,
    isActivityError: false,
    isEditing: false,
    isSubmitting: false,
    serverMessage: null,
    metrics: [
      { id: "completed", label: labels.completedJourneys, value: 4 },
      { id: "in-progress", label: labels.inProgressJourneys, value: 1 },
      { id: "privacy", label: labels.privacyAverage, value: 80 },
      { id: "security", label: labels.securityAverage, value: 70 },
      { id: "combined", label: labels.combinedAverage, value: 75 },
    ],
    theme: "dark",
    labels,
    handleEdit: vi.fn(),
    handleCancel: vi.fn(),
    handleSubmit: vi.fn(async () => {}),
    handleRetry: vi.fn(),
    handleRetryActivity: vi.fn(),
    handleCloseMessage: vi.fn(),
    handleThemeChange: vi.fn(),
    ...overrides,
  };
}

describe("ProfileView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    changeLocaleSpy.mockClear();
  });

  it("renders the profile, activity summary, preferences, and heading hierarchy", () => {
    vi.spyOn(viewModelModule, "useProfileVM").mockReturnValue(makeViewModel());
    render(<ProfileView />);

    expect(screen.getByRole("heading", { level: 1, name: "Meu perfil" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Dados pessoais" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Ana Souza" })).toBeTruthy();
    expect(screen.getAllByText("Instituto Exemplo")).toHaveLength(2);
    expect(screen.getByText("E-21")).toBeTruthy();
    expect(screen.getByText("Jornadas concluídas")).toBeTruthy();
    expect(screen.getByText("Jornadas em andamento")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Preferências" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "PT" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "EN" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("shows required edit fields and keeps employee code disabled", () => {
    const handleCancel = vi.fn();
    vi.spyOn(viewModelModule, "useProfileVM").mockReturnValue(
      makeViewModel({ isEditing: true, handleCancel }),
    );
    render(<ProfileView />);

    expect(screen.getByLabelText(/Nome completo/).getAttribute("aria-required")).toBe("true");
    expect(screen.getByLabelText(/Órgão\/empresa/).getAttribute("aria-required")).toBe("true");
    expect(screen.getByLabelText(/E-mail/).getAttribute("aria-required")).toBe("true");
    expect(screen.getByLabelText(/Setor/).getAttribute("aria-required")).toBe("true");
    expect(screen.getByLabelText("Código de funcionário")).toHaveProperty("disabled", true);
    expect(screen.getByText("O código não pode ser alterado.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(handleCancel).toHaveBeenCalledOnce();
  });

  it("shows server alerts and disables form actions while saving", () => {
    vi.spyOn(viewModelModule, "useProfileVM").mockReturnValue(
      makeViewModel({
        isEditing: true,
        isSubmitting: true,
        serverMessage: {
          title: "Erro ao salvar",
          description: "Erro de servidor.",
          variant: "destructive",
        },
      }),
    );
    render(<ProfileView />);

    expect(screen.getByRole("alert").textContent).toContain("Erro de servidor.");
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveProperty("disabled", true);
  });

  it("shows the activity error with its own retry and keeps the personal data", () => {
    const handleRetryActivity = vi.fn();
    vi.spyOn(viewModelModule, "useProfileVM").mockReturnValue(
      makeViewModel({ isActivityError: true, handleRetryActivity }),
    );
    render(<ProfileView />);

    expect(screen.getByText("Erro ao carregar a atividade")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Ana Souza" })).toBeTruthy();
    expect(screen.queryByText("Jornadas concluídas")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(handleRetryActivity).toHaveBeenCalledTimes(1);
  });

  it("offers light, dark and high contrast themes and calls handleThemeChange", () => {
    const handleThemeChange = vi.fn();
    vi.spyOn(viewModelModule, "useProfileVM").mockReturnValue(
      makeViewModel({ handleThemeChange }),
    );
    render(<ProfileView />);

    expect(screen.getByRole("radio", { name: "Claro" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Escuro" })).toHaveProperty("checked", true);
    expect(screen.getByRole("radio", { name: "Alto contraste" })).toHaveProperty(
      "disabled",
      false,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Alto contraste" }));
    expect(handleThemeChange).toHaveBeenCalledWith("high-contrast");
    fireEvent.click(screen.getByRole("radio", { name: "Claro" }));
    expect(handleThemeChange).toHaveBeenCalledWith("light");
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(changeLocaleSpy).toHaveBeenCalledWith("en");
  });
});
