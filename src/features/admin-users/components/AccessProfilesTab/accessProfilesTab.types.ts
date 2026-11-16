import type { AccessProfile, AdminUsersLabels } from "../../adminUsers.types";

export interface AccessProfilesTabProps {
  profiles: AccessProfile[];
  labels: AdminUsersLabels;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export interface AccessProfilesTabViewModelReturn {
  profiles: AccessProfile[];
  labels: AdminUsersLabels;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}
