import type { AccessProfile, AdminUsersLabels } from "../../adminUsers.types";

export interface AccessProfilesTabProps {
  profiles: AccessProfile[];
  labels: AdminUsersLabels;
  isLoading?: boolean;
}

export interface AccessProfilesTabViewModelReturn {
  profiles: AccessProfile[];
  labels: AdminUsersLabels;
  isLoading: boolean;
}
