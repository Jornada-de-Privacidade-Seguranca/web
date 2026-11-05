"use client";

import { useRef } from "react";
import { AlertDialog } from "radix-ui";
import { Button } from "@components/ui";
import { useSessionExpiredDialogVM } from "./sessionExpiredDialog.viewmodel";
import type { SessionExpiredDialogProps } from "./sessionExpiredDialog.types";

/**
 * Aviso de sessão expirada. Fica sempre aberto e não fecha por clique fora nem
 * pelo Esc: a única saída é o botão que leva ao login.
 */
export function SessionExpiredDialog(props: SessionExpiredDialogProps) {
  const { labels, onConfirm, handleEscapeKeyDown } = useSessionExpiredDialogVM(props);
  const actionRef = useRef<HTMLButtonElement>(null);

  // Sem botão de cancelar, o foco inicial vai direto para a única ação
  function handleOpenAutoFocus(event: Event) {
    event.preventDefault();
    actionRef.current?.focus();
  }

  return (
    <AlertDialog.Root open>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0" />
        <AlertDialog.Content
          onEscapeKeyDown={handleEscapeKeyDown}
          onOpenAutoFocus={handleOpenAutoFocus}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95"
        >
          <AlertDialog.Title className="font-heading text-lg font-bold text-card-foreground">
            {labels.title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {labels.description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end">
            <AlertDialog.Action asChild>
              <Button ref={actionRef} onClick={onConfirm} className="w-full sm:w-auto">
                {labels.action}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
