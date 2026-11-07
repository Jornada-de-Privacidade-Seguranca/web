import type {
  AdminUserDetails,
  AdminUserDetailLabels,
} from "../../adminUserDetail.types";

export interface UserHeaderProps {
  user: AdminUserDetails;
  labels: AdminUserDetailLabels;
  isTogglingStatus: boolean;
  canManageUser?: boolean;
  onToggleStatus: () => void;
}

export interface UserHeaderViewModelReturn {
  name: string;
  initials: string;
  department: string;
  roleLabel: string;
  statusLabel: string;
  statusColorClasses: string;
  isActive: boolean;
  statusToggleText: string;
  isTogglingStatus: boolean;
  canManageUser: boolean;
  onToggleStatus: () => void;
  backToListText: string;
}
