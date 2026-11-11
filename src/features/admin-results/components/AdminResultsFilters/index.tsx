"use client";

import { useId } from "react";
import { FilterRemoveIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input } from "@/components/ui";
import { useAdminResultsFiltersVM } from "./adminResultsFilters.viewmodel";
import type { AdminResultsFiltersProps } from "./adminResultsFilters.types";

export function AdminResultsFilters(props: AdminResultsFiltersProps) {
  const {
    search,
    userId,
    department,
    journeyProfileId,
    dateFrom,
    dateTo,
    users,
    departments,
    domainOptions,
    journeyProfiles,
    counterText,
    hasActiveFilters,
    labels,
    onSearchChange,
    onUserChange,
    onDepartmentChange,
    onToggleDomain,
    onProfileChange,
    onDateFromChange,
    onDateToChange,
    onClearFilters,
  } = useAdminResultsFiltersVM(props);

  const dateFromId = useId();
  const dateToId = useId();

  return (
    <section
      aria-label={labels.filtersAriaLabel}
      className="space-y-4 rounded-3xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-md"
    >
      {/* Linha 1: Busca e Seletores principais */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 rounded-full border-border/80 bg-background pl-10 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            aria-label={labels.searchPlaceholder}
          />
        </div>

        <div>
          <select
            value={userId}
            onChange={(e) => onUserChange(e.target.value)}
            className="h-10 w-full rounded-full border border-border/80 bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={labels.filterUser}
          >
            <option value="">{labels.filterAllUsers}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="h-10 w-full rounded-full border border-border/80 bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={labels.filterDepartment}
          >
            <option value="">{labels.filterAllDepartments}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={journeyProfileId}
            onChange={(e) => onProfileChange(e.target.value)}
            className="h-10 w-full rounded-full border border-border/80 bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={labels.filterProfile}
          >
            <option value="">{labels.filterAllProfiles}</option>
            {journeyProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Linha 2: Domínio (seleção múltipla) e Período de conclusão */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {labels.filterDomains}
          </span>
          <div role="group" aria-label={labels.filterDomains} className="flex flex-wrap gap-2">
            {domainOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggleDomain(option.id)}
                aria-pressed={option.isSelected}
                className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  option.isSelected
                    ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                    : "bg-muted/70 text-muted-foreground ring-1 ring-border/50 hover:bg-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor={dateFromId}
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {labels.filterDateFrom}
            </label>
            <Input
              id={dateFromId}
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="h-10 rounded-full border-border/80 bg-background px-4 text-sm text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor={dateToId}
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {labels.filterDateTo}
            </label>
            <Input
              id={dateToId}
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => onDateToChange(e.target.value)}
              className="h-10 rounded-full border-border/80 bg-background px-4 text-sm text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Linha 3: Contador e Limpar filtros */}
      <div className="flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span aria-live="polite" className="font-medium text-foreground">
          {counterText}
        </span>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={FilterRemoveIcon} size={14} aria-hidden="true" className="mr-1.5" />
            <span>{labels.filterClear}</span>
          </Button>
        )}
      </div>
    </section>
  );
}

export * from "./adminResultsFilters.types";

