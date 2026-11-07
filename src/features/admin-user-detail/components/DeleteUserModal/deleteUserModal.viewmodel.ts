import type {
  DeleteUserModalProps,
  DeleteUserModalViewModelReturn,
} from "./deleteUserModal.types";

export function useDeleteUserModalVM(
  props: DeleteUserModalProps
): DeleteUserModalViewModelReturn {
  const { isOpen, userName, isDeleting, labels, onCancel, onConfirm } = props;

  return {
    isOpen,
    title: labels.modalTitle,
    description: labels.modalDescription(userName),
    cancelText: labels.modalCancel,
    confirmText: labels.modalConfirm,
    isDeleting,
    onCancel,
    onConfirm,
  };
}
