import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@/shared/i18n/routing";
import type { ThemeMode } from "@/shared/theme";
import type { MetricsGridItem } from "@/components/ui/MetricsGrid/metricsGrid.types";

export interface UserProfile {
  name: string;
  organization: string;
  email: string;
  employeeCode: string;
  department: string;
}

/** Médias de 0 a 100; null quando não há jornada concluída no domínio. */
export interface ProfileActivity {
  completedJourneys: number;
  inProgressJourneys: number;
  averageByDomain: {
    privacy: number | null;
    security: number | null;
    combined: number | null;
  };
}

export type ProfileFormValues = UserProfile;

export type ProfileEditableField = "name" | "organization" | "email" | "department";

/** Só os campos alterados vão para o PATCH /me. */
export type ProfileUpdatePayload = Partial<Pick<UserProfile, ProfileEditableField>>;

/** Dados de GET /me e PATCH /me (AuthenticatedUserResource) usados pelo perfil. */
export interface OwnProfileApi {
  id: number;
  name: string | null;
  email: string | null;
  organization: string | null;
  department: string | null;
  registration_number: string | null;
}

/** Corpo do PATCH /me, com os nomes de campo da API. */
export type OwnProfileUpdateApi = Partial<
  Pick<OwnProfileApi, "name" | "email" | "organization" | "department">
>;

/** Partes de GET /users/{user}/journeys/metrics usadas no resumo de atividade. */
export interface ProfileMetricsApi {
  summary: {
    completed_journeys: number;
    ongoing_journeys: number;
  };
  domains: {
    domain_id: number;
    average_score: number | null;
  }[];
}

export interface ProfileServerMessage {
  title: string;
  description: string;
  variant: "destructive" | "success";
}

export interface ProfileLabels {
  title: string;
  subtitle: string;
  editProfile: string;
  personalData: string;
  fullName: string;
  organization: string;
  email: string;
  employeeCode: string;
  department: string;
  employeeCodeHelp: string;
  notProvided: string;
  save: string;
  cancel: string;
  activityTitle: string;
  completedJourneys: string;
  inProgressJourneys: string;
  privacyAverage: string;
  securityAverage: string;
  combinedAverage: string;
  loading: string;
  loadErrorTitle: string;
  loadErrorDescription: string;
  retry: string;
  activityLoadError: string;
  notAvailable: string;
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  unauthorizedError: string;
  serverError: string;
  genericError: string;
  closeMessage: string;
  validation: {
    nameRequired: string;
    nameLastName: string;
    nameMaxLength: string;
    organizationRequired: string;
    organizationMaxLength: string;
    emailRequired: string;
    emailInvalid: string;
    emailMaxLength: string;
    departmentRequired: string;
    departmentMaxLength: string;
    employeeCodeImmutable: string;
    emailInUse: string;
  };
  preferencesTitle: string;
  language: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  themeHighContrast: string;
  themeHighContrastUnavailable: string;
}

export interface ProfileLanguageOption {
  locale: Locale;
  label: string;
}

export interface ProfileViewModelReturn {
  profile: UserProfile | null;
  initials: string;
  form: UseFormReturn<ProfileFormValues>;
  isLoading: boolean;
  isLoadError: boolean;
  isActivityLoading: boolean;
  isActivityError: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  serverMessage: ProfileServerMessage | null;
  metrics: MetricsGridItem[];
  locale: Locale;
  languageOptions: ProfileLanguageOption[];
  theme: ThemeMode;
  labels: ProfileLabels;
  handleEdit: () => void;
  handleCancel: () => void;
  handleSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  handleRetry: () => void;
  handleRetryActivity: () => void;
  handleCloseMessage: () => void;
  handleLocaleChange: (locale: Locale) => void;
  handleThemeChange: (mode: ThemeMode) => void;
}
