"use client";

import { useRef } from "react";
import { AlertDialog } from "radix-ui";
import { Button } from "@components/ui";
import { useSessionTimeoutWarningVM } from "./sessionTimeoutWarning.viewmodel";

/**
 * Aviso de que a sessão vai expirar, com contagem regressiva. Não fecha por
 * clique fora nem pelo Esc: o usuário escolhe entre continuar conectado e sair.
 * A contagem em mm:ss é só visual; o leitor de tela recebe o tempo em minutos,
 * para não ser interrompido a cada segundo.
 */
export function SessionTimeoutWarning() {
  const { isOpen, isRenewing, labels, handleRenew, handleLogout, handleEscapeKeyDown } =
    useSessionTimeoutWarningVM();
  const renewRef = useRef<HTMLButtonElement>(null);

  function handleOpenAutoFocus(event: Event) {
    event.preventDefault();
    renewRef.current?.focus();
  }

  return (
    <AlertDialog.Root open={isOpen}>
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
            <span aria-hidden="true" className="tabular-nums">
              {labels.countdown}
            </span>
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              {labels.announcement}
            </span>{" "}
            {labels.hint}
          </AlertDialog.Description>
          {labels.renewError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {labels.renewError}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isRenewing}
              className="w-full sm:w-auto"
            >
              {labels.logout}
            </Button>
            <Button
              ref={renewRef}
              onClick={handleRenew}
              aria-busy={isRenewing}
              className="w-full sm:w-auto"
            >
              {labels.renew}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
