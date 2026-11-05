"use client";

import type React from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui";
import { cn } from "@/shared/lib/utils";
import { StepHeader } from "../StepHeader";
import { useMultiSelectSearchStepVM } from "./multiSelectSearchStep.viewmodel";
import type {
  MultiSelectItemListProps,
  MultiSelectSearchStepProps,
} from "./multiSelectSearchStep.types";

function ItemList({
  items,
  selectedIds,
  emptyLabel,
  isLimitReached,
  onToggleItem,
}: MultiSelectItemListProps) {
  if (items.length === 0) {
    return (
      <p role="status" className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="grid max-h-[360px] gap-3 overflow-y-auto pr-1">
      {items.map((item) => {
        const isSelected = selectedIds.has(item.id);
        // Com o limite atingido, só os selecionados podem ser alterados. O item
        // continua focável (aria-disabled em vez de disabled) para o leitor de
        // tela informar que ele existe
        const isDisabled = isLimitReached && !isSelected;
        const inputId = `multi-select-item-${item.id}`;

        return (
          <li key={item.id}>
            <label
              htmlFor={inputId}
              className={cn(
                "group flex w-full select-none items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-150",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary",
                isSelected
                  ? "cursor-pointer border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                  : isDisabled
                    ? "cursor-not-allowed border-border/40 bg-muted/10 text-muted-foreground opacity-50"
                    : "cursor-pointer border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={isSelected}
                aria-disabled={isDisabled || undefined}
                onChange={() => {
                  if (!isDisabled) onToggleItem(item.id);
                }}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40 bg-transparent group-hover:border-foreground/60"
                )}
              >
                {isSelected && <HugeiconsIcon icon={Tick02Icon} size={14} />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium leading-normal text-foreground">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * @deprecated Etapa de múltipla seleção com busca usada pelas telas do pré-questionário (formação acadêmica e certificações profissionais), que saíram do fluxo da jornada. Mantida para reaproveitamento futuro; não é usada por nenhuma tela.
 */
export function MultiSelectSearchStep(props: MultiSelectSearchStepProps) {
  const {
    icon,
    stepTag,
    journeyTitle,
    title,
    description,
    searchTerm,
    onSearchChange,
    searchPlaceholder,
    searchAriaLabel,
    groups,
    hasGroups,
    activeGroupId,
    onGroupChange,
    groupsAriaLabel,
    items,
    selectedItems,
    selectedIds,
    onToggleItem,
    onRemoveItem,
    removeItemAriaLabel,
    emptyLabel,
    counterLabel,
    onContinue,
    onBack,
    onExit,
    isSubmitting,
    canContinue,
    isLimitReached,
    limitReachedLabel,
    groupColumns,
    backLabel = "Voltar",
    backAriaLabel,
    continueLabel = "Continuar",
    savingLabel,
    exitLabel = "Sair",
    exitAriaLabel = "Sair da etapa",
  } = useMultiSelectSearchStepVM(props);

  const itemList = (
    <>
      {isLimitReached && limitReachedLabel && (
        <p
          role="status"
          className="mb-3 rounded-xl border border-warning/50 bg-warning/10 px-3 py-2 text-xs text-foreground"
        >
          {limitReachedLabel}
        </p>
      )}
      <ItemList
        items={items}
        selectedIds={selectedIds}
        emptyLabel={emptyLabel}
        isLimitReached={isLimitReached}
        onToggleItem={onToggleItem}
      />
    </>
  );

  return (
    <div className="flex min-h-full w-full flex-col bg-background text-foreground">
      <StepHeader
        stepTag={stepTag}
        journeyTitle={journeyTitle}
        onExit={onExit}
        exitLabel={exitLabel}
        exitAriaLabel={exitAriaLabel}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12">
        {/* Título com ícone */}
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <HugeiconsIcon icon={icon} size={22} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <section className="rounded-[2rem] border border-border bg-card/90 p-4 shadow-md backdrop-blur-xl md:p-6">
          {/* Busca */}
          <div className="relative mb-4">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
              className="h-10 bg-muted/20 pl-9"
            />
          </div>

          {/* Chips dos selecionados (todas as abas), com altura máxima e rolagem
              própria para que muitas seleções não empurrem a lista para fora da tela */}
          {selectedItems.length > 0 && (
            <ul
              data-testid="multi-select-chips"
              className="mb-6 flex max-h-36 flex-wrap content-start gap-2 overflow-y-auto pr-1"
            >
              {selectedItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={removeItemAriaLabel(item.label)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span>{item.label}</span>
                    <HugeiconsIcon icon={Cancel01Icon} size={12} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Abas (opcionais) e lista de itens */}
          {hasGroups && groups ? (
            <Tabs value={activeGroupId} onValueChange={onGroupChange}>
              <TabsList
                aria-label={groupsAriaLabel}
                // Uma coluna por aba em telas maiores (2 abas não deixam espaço vazio)
                style={{ "--tab-columns": groupColumns } as React.CSSProperties}
                className="grid h-auto w-full grid-cols-2 items-stretch gap-1 bg-muted/30 sm:[grid-template-columns:repeat(var(--tab-columns),minmax(0,1fr))]"
              >
                {groups.map((group) => (
                  <TabsTrigger
                    key={group.id}
                    value={group.id}
                    className="min-w-0 px-2 py-1.5 text-center text-[11px] leading-tight whitespace-normal [overflow-wrap:anywhere] sm:text-xs md:px-3"
                  >
                    {group.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {groups.map((group) => (
                <TabsContent key={group.id} value={group.id} className="mt-4">
                  {itemList}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            itemList
          )}
        </section>

        {/* Rodapé de navegação */}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            {onBack ? (
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                aria-label={backAriaLabel}
                className="gap-1.5"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                <span>{backLabel}</span>
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span aria-live="polite" className="text-xs text-muted-foreground">
              {counterLabel}
            </span>
            <Button onClick={onContinue} disabled={!canContinue} className="gap-2 px-6">
              <span>{isSubmitting ? (savingLabel ?? continueLabel) : continueLabel}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
