import { getInitials } from "@/shared/utils/initials";
import type {
  UserHeaderProps,
  UserHeaderViewModelReturn,
} from "./userHeader.types";

export function useUserHeaderVM(
  props: UserHeaderProps
): UserHeaderViewModelReturn {
  const { user, labels, isTogglingStatus, onToggleStatus } = props;

  const isActive = user.status === "active";
  const displayName = user.name?.trim() || user.email;
  const initials = user.initials?.trim() || getInitials(displayName);
  const department = user.department?.trim() || "—";

  const getStatusMeta = () => {
    switch (user.status) {
      case "active":
        return {
          label: labels.accountActive,
          classes:
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
        };
      case "pending":
        return {
          label: labels.accountPending,
          classes:
            "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
        };
      case "inactive":
      default:
        return {
          label: labels.accountInactive,
          classes:
            "bg-muted text-muted-foreground ring-1 ring-border/60",
        };
    }
  };

  const statusMeta = getStatusMeta();

  return {
    name: displayName,
    initials,
    department,
    roleLabel: user.roleLabel,
    statusLabel: statusMeta.label,
    statusColorClasses: statusMeta.classes,
    isActive,
    statusToggleText: isActive
      ? labels.statusDeactivate
      : labels.statusActivate,
    isTogglingStatus,
    canManageUser: props.canManageUser ?? true,
    onToggleStatus,
    backToListText: labels.backToList,
    backHref: props.backHref ?? "/admin/usuarios",
  };
}
