"use client";

import {
  Search01Icon,
  FilterRemoveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input } from "@/components/ui";
import { useUserFiltersVM } from "./userFilters.viewmodel";
import type { UserFiltersProps } from "./userFilters.types";

export function UserFilters(props: UserFiltersProps) {
  const {
    search,
    department,
    role,
    status,
    availableDepartments,
    availableRoles,
    availableStatuses,
    counterText,
    hasActiveFilters,
    onSearchChange,
    onDepartmentChange,
    onRoleChange,
    onStatusChange,
    onClearFilters,
    searchPlaceholder,
    allDepartmentsLabel,
    allRolesLabel,
    allStatusesLabel,
    clearLabel,
  } = useUserFiltersVM(props);

  return (
    <div className="space-y-4 rounded-3xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Campo de Busca */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 rounded-full bg-background border-border/80 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            aria-label={searchPlaceholder}
          />
        </div>

        {/* Seletor de Setor */}
        <div>
          <select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full h-10 rounded-full bg-background border border-border/80 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={allDepartmentsLabel}
          >
            <option value="">{allDepartmentsLabel}</option>
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Perfil de Acesso */}
        <div>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full h-10 rounded-full bg-background border border-border/80 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={allRolesLabel}
          >
            <option value="">{allRolesLabel}</option>
            {availableRoles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Situação */}
        <div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full h-10 rounded-full bg-background border border-border/80 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={allStatusesLabel}
          >
            <option value="">{allStatusesLabel}</option>
            {availableStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Linha de Contador e Ação de Limpeza */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{counterText}</span>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground rounded-full"
          >
            <HugeiconsIcon icon={FilterRemoveIcon} size={14} className="mr-1.5" />
            <span>{clearLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export * from "./userFilters.types";
