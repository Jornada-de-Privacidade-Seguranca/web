"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useStepHeaderVM } from "./stepHeader.viewmodel";
import type { StepHeaderProps } from "./stepHeader.types";

/**
 * Barra superior das etapas da jornada: botão "Sair", tag da etapa e nome do
 * perfil. Textos longos são cortados com reticências, com o texto completo no
 * atributo title, para o cabeçalho manter a altura fixa em telas estreitas.
 */
export function StepHeader(props: StepHeaderProps) {
  const {
    stepTag,
    journeyTitle,
    onExit,
    exitLabel = "Sair",
    exitAriaLabel = "Sair da etapa",
  } = useStepHeaderVM(props);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onExit}
          aria-label={exitAriaLabel}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
          <span>{exitLabel}</span>
        </button>

        <div className="hidden h-5 w-px shrink-0 bg-border/60 sm:block" />

        <div className="flex min-w-0 flex-col">
          {stepTag && (
            <span
              title={stepTag}
              className="truncate text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground"
            >
              {stepTag}
            </span>
          )}
          {journeyTitle && (
            <span
              title={journeyTitle}
              className="truncate text-sm font-semibold text-foreground"
            >
              {journeyTitle}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export * from "./stepHeader.types";
