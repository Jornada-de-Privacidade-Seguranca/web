"use client";

import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui";
import { useUserHeaderVM } from "./userHeader.viewmodel";
import type { UserHeaderProps } from "./userHeader.types";

export function UserHeader(props: UserHeaderProps) {
  const {
    name,
    initials,
    department,
    roleLabel,
    statusLabel,
    statusColorClasses,
    isActive,
    statusToggleText,
    isTogglingStatus,
    canManageUser,
    onToggleStatus,
    backToListText,
  } = useUserHeaderVM(props);

  return (
    <div className="space-y-4">
      {/* Botão Voltar */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 -ml-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <Link href="/admin/usuarios">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1.5" />
          <span>{backToListText}</span>
        </Link>
      </Button>

      {/* Bloco de Informações do Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-base font-bold ring-2 ring-primary/20"
          >
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-bold text-foreground">
                {name}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColorClasses}`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {department} • <span className="font-medium text-foreground">{roleLabel}</span>
            </p>
          </div>
        </div>

        {/* Botão de Controle de Ativação (apenas com permissão de gerenciamento) */}
        {canManageUser && (
          <Button
            type="button"
            variant={isActive ? "outline" : "default"}
            onClick={onToggleStatus}
            disabled={isTogglingStatus}
            className="rounded-full text-xs font-semibold shrink-0"
          >
            <HugeiconsIcon
              icon={isActive ? Cancel01Icon : CheckmarkCircle02Icon}
              size={14}
              className="mr-1.5"
            />
            <span>{statusToggleText}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export * from "./userHeader.types";
