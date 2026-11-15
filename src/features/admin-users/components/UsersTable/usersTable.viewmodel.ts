import { getInitials } from "@/shared/utils/initials";
import type {
  UsersTableProps,
  UsersTableViewModelReturn,
  UserRowItem,
} from "./usersTable.types";
import type { UserStatus } from "../../adminUsers.types";

export function useUsersTableVM(
  props: UsersTableProps
): UsersTableViewModelReturn {
  const { users, labels } = props;

  const getStatusMeta = (status: UserStatus) => {
    switch (status) {
      case "active":
        return {
          label: labels.filterStatusActive,
          classes:
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
        };
      case "pending":
        return {
          label: labels.filterStatusPending,
          classes:
            "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
        };
      case "inactive":
      default:
        return {
          label: labels.filterStatusInactive,
          classes:
            "bg-muted text-muted-foreground ring-1 ring-border/60",
        };
    }
  };

  const rows: UserRowItem[] = users.map((user) => {
    const statusMeta = getStatusMeta(user.status);
    const displayName = user.name?.trim() || user.email;
    const initials = user.initials?.trim() || getInitials(displayName);

    return {
      id: user.id,
      name: displayName,
      email: user.email,
      initials,
      employeeCode: user.employeeCode?.trim() || "—",
      department: user.department?.trim() || "—",
      roleLabel: user.roleLabel,
      status: user.status,
      statusLabel: statusMeta.label,
      statusColorClasses: statusMeta.classes,
      journeysCount: user.journeysCount,
      manageHref: `/admin/usuarios/${user.id}`,
    };
  });

  return {
    rows,
    labels,
    isEmpty: rows.length === 0,
  };
}
