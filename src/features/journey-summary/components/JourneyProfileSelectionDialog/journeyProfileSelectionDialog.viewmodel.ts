import type {
  JourneyProfileSelectionDialogProps,
  JourneyProfileSelectionDialogViewModelReturn,
} from "./journeyProfileSelectionDialog.types";

export function useJourneyProfileSelectionDialogVM(
  props: JourneyProfileSelectionDialogProps
): JourneyProfileSelectionDialogViewModelReturn {
  const { onCancel, ...rest } = props;

  // Enquanto salva o perfil e cria a jornada, o diálogo não fecha
  const handleOpenChange = (open: boolean) => {
    if (!open && !rest.isConfirming) onCancel();
  };

  return { ...rest, handleOpenChange };
}
