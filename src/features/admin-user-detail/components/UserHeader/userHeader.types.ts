import type {
  AdminUserDetails,
  AdminUserDetailLabels,
} from "../../adminUserDetail.types";

export interface UserHeaderProps {
  user: AdminUserDetails;
  labels: AdminUserDetailLabels;
  /** Link do "Voltar", com a busca, os filtros e a página da listagem. */
  backHref?: string;
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
  backHref: string;
}
