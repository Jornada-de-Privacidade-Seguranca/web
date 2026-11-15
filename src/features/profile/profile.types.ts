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

export interface ProfileActivity {
  completedJourneys: number;
  inProgressJourneys: number;
  averageByDomain: {
    privacy: number;
    security: number;
    combined: number;
  };
}

export interface ProfileData {
  user: UserProfile;
  activity: ProfileActivity;
}

export type ProfileFormValues = UserProfile;

export type ProfileUpdatePayload = Pick<
  UserProfile,
  "name" | "organization" | "email" | "department"
>;

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
  profile: ProfileData | null;
  initials: string;
  form: UseFormReturn<ProfileFormValues>;
  isLoading: boolean;
  isLoadError: boolean;
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
  handleCloseMessage: () => void;
  handleLocaleChange: (locale: Locale) => void;
  handleThemeChange: (mode: ThemeMode) => void;
}
