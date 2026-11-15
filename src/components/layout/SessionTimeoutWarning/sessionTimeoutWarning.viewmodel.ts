"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/features/auth/auth.store";
import { endSessionInUse, useAuth } from "@/hooks/useAuth";
import { renewSession } from "@/services/authService";
import { ApiRequestError } from "@/services/httpClient";
import {
  getServerSessionActivitySnapshot,
  getSessionActivitySnapshot,
  subscribeSessionActivity,
} from "@/shared/utils/sessionActivity";
import { useSidebarStore } from "@/store/sidebar.store";
import type { SessionTimeoutWarningViewModelReturn } from "./sessionTimeoutWarning.types";

/** Antecedência do aviso em relação ao vencimento previsto da sessão. */
export const SESSION_WARNING_LEAD_MS = 5 * 60 * 1000;

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;

function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / SECOND_MS);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Prevê o vencimento da sessão (última atividade, em qualquer aba, mais o tempo
 * de vida) e abre o aviso 5 minutos antes. Nunca renova a sessão sozinho: só o
 * botão "Continuar conectado" chama a API. Se a contagem chegar a zero, segue o
 * fluxo de sessão expirada sem esperar o próximo 401.
 */
export function useSessionTimeoutWarningVM(): SessionTimeoutWarningViewModelReturn {
  const t = useTranslations("sessionWarning");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const { logout } = useAuth();
  const { lastActivityAt, lifetimeMinutes } = useSyncExternalStore(
    subscribeSessionActivity,
    getSessionActivitySnapshot,
    getServerSessionActivitySnapshot
  );
  const [now, setNow] = useState(() => Date.now());
  const [isRenewing, setIsRenewing] = useState(false);
  const [hasRenewError, setHasRenewError] = useState(false);

  const isTracking = isAuthenticated && !sessionExpired;
  const expiresAt =
    lastActivityAt !== null && lifetimeMinutes !== null
      ? lastActivityAt + lifetimeMinutes * MINUTE_MS
      : null;

  // Fora da janela do aviso, um único timer espera ela começar; dentro dela, o
  // relógio avança a cada virada de segundo. Cada passo relê o horário, então
  // um timer atrasado (aba em segundo plano, computador suspenso) não engana
  useEffect(() => {
    if (!isTracking || expiresAt === null) return;
    const deadline = expiresAt;
    setHasRenewError(false);

    let timer: ReturnType<typeof setTimeout> | undefined;
    function tick() {
      const current = Date.now();
      setNow(current);
      const remaining = deadline - current;
      if (remaining <= 0) {
        endSessionInUse();
        return;
      }
      const untilWarning = remaining - SESSION_WARNING_LEAD_MS;
      const delay = untilWarning > 0 ? untilWarning : remaining % SECOND_MS || SECOND_MS;
      timer = setTimeout(tick, delay);
    }
    tick();

    return () => clearTimeout(timer);
  }, [isTracking, expiresAt]);

  const remainingMs = expiresAt === null ? 0 : Math.max(expiresAt - now, 0);
  const isOpen =
    isTracking && expiresAt !== null && remainingMs > 0 && remainingMs <= SESSION_WARNING_LEAD_MS;

  // O aviso é outro diálogo modal: o drawer fecha para não disputar o foco com ele
  useEffect(() => {
    if (isOpen) setMobileOpen(false);
  }, [isOpen, setMobileOpen]);

  async function handleRenew() {
    if (isRenewing) return;
    setIsRenewing(true);
    setHasRenewError(false);
    try {
      // A resposta bem-sucedida passa pelo httpClient, que registra a atividade
      // e, com ela, adia o vencimento e fecha o aviso
      await renewSession();
    } catch (error: unknown) {
      // O 401 já seguiu o fluxo de sessão expirada pelo httpClient
      const isUnauthorized = error instanceof ApiRequestError && error.status === 401;
      if (!isUnauthorized) setHasRenewError(true);
    } finally {
      setIsRenewing(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // A sessão local é encerrada mesmo sem resposta do backend
    }
  }

  function handleEscapeKeyDown(event: KeyboardEvent) {
    event.preventDefault();
  }

  return {
    isOpen,
    isRenewing,
    labels: {
      title: t("title"),
      countdown: t("countdown", { time: formatCountdown(remainingMs) }),
      announcement: t("announcement", { minutes: Math.ceil(remainingMs / MINUTE_MS) }),
      hint: t("hint"),
      renew: isRenewing ? t("renewing") : t("renew"),
      logout: t("logout"),
      renewError: hasRenewError ? t("renewError") : undefined,
    },
    handleRenew,
    handleLogout,
    handleEscapeKeyDown,
  };
}
