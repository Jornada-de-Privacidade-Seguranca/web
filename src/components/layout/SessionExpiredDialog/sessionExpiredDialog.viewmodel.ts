"use client";

import { useTranslations } from "next-intl";
import type {
  SessionExpiredDialogProps,
  SessionExpiredDialogViewModelReturn,
} from "./sessionExpiredDialog.types";

export function useSessionExpiredDialogVM({
  onConfirm,
}: SessionExpiredDialogProps): SessionExpiredDialogViewModelReturn {
  const t = useTranslations("sessionExpired");

  function handleEscapeKeyDown(event: KeyboardEvent) {
    event.preventDefault();
  }

  return {
    labels: {
      title: t("title"),
      description: t("description"),
      action: t("action"),
    },
    onConfirm,
    handleEscapeKeyDown,
  };
}
