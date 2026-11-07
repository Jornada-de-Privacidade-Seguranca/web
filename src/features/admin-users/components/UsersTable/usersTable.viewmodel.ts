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
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials,
      employeeCode: user.employeeCode,
      department: user.department,
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
