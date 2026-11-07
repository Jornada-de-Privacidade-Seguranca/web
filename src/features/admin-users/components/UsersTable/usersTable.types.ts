import type {
  AdminUserListItem,
  AdminUsersLabels,
  UserStatus,
} from "../../adminUsers.types";

export interface UsersTableProps {
  users: AdminUserListItem[];
  labels: AdminUsersLabels;
  isLoading?: boolean;
}

export interface UserRowItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  employeeCode: string;
  department: string;
  roleLabel: string;
  status: UserStatus;
  statusLabel: string;
  statusColorClasses: string;
  journeysCount: number;
  manageHref: string;
}

export interface UsersTableViewModelReturn {
  rows: UserRowItem[];
  labels: AdminUsersLabels;
  isEmpty: boolean;
}
