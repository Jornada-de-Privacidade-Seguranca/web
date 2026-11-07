import type { AdminUserDetailLabels } from "../../adminUserDetail.types";

export interface DeleteUserModalProps {
  isOpen: boolean;
  userName: string;
  isDeleting: boolean;
  labels: AdminUserDetailLabels;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface DeleteUserModalViewModelReturn {
  isOpen: boolean;
  title: string;
  description: string;
  cancelText: string;
  confirmText: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
