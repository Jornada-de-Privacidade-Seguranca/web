"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@components/ui";
import { cn } from "@/shared/lib/utils";
import { useSingleChoiceQuestionStepVM } from "./singleChoiceQuestionStep.viewmodel";
import type { SingleChoiceQuestionStepProps } from "./singleChoiceQuestionStep.types";

export function SingleChoiceQuestionStep<T extends string = string>(
  props: SingleChoiceQuestionStepProps<T>
) {
  const {
    icon,
    title,
    description,
    questionLabel,
    options,
    selectedOption,
    onSelectOption,
    onContinue,
    onBack,
    onExit,
    isSubmitting,
    journeyTitle,
    stepTag,
    backLabel = "Voltar",
    continueLabel = "Continuar",
    exitLabel = "Sair",
    exitAriaLabel = "Sair da etapa",
    canContinue,
  } = useSingleChoiceQuestionStepVM(props);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Barra superior de navegação / contexto */}
      <header className="fixed top-0 right-0 left-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExit}
            aria-label={exitAriaLabel}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
            <span>{exitLabel}</span>
          </button>

          <div className="hidden h-5 w-px bg-border/60 sm:block" />

          <div className="flex flex-col">
            {stepTag && (
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {stepTag}
              </span>
            )}
            {journeyTitle && (
              <span className="text-sm font-semibold text-foreground">
                {journeyTitle}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 pt-24 pb-12">
        {/* Título com ícone */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <HugeiconsIcon icon={icon} size={22} />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
        </div>

        {/* Card de pergunta e opções */}
        <section className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-md backdrop-blur-xl md:p-8">
          <div className="mb-6">
            <h2 className="font-heading text-base font-semibold text-card-foreground md:text-lg">
              {questionLabel}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div
            role="radiogroup"
            aria-label={questionLabel}
            className="space-y-3"
          >
            {options.map((option) => {
              const isSelected = selectedOption === option.id;

              return (
                <div
                  key={option.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => onSelectOption(option.id)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      onSelectOption(option.id);
                    }
                  }}
                  className={cn(
                    "group flex items-center gap-3.5 w-full rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer select-none",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30 text-foreground"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Círculo indicador do radio */}
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40 bg-transparent group-hover:border-foreground/60"
                    )}
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    )}
                  </span>

                  <span className="text-sm font-medium leading-normal">
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rodapé de navegação */}
        <footer className="mt-8 flex items-center justify-between gap-4">
          <div>
            {onBack ? (
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                <span>{backLabel}</span>
              </Button>
            ) : (
              <div />
            )}
          </div>

          <Button
            onClick={onContinue}
            disabled={!canContinue}
            className="gap-2 px-6"
          >
            <span>{isSubmitting ? "Salvando..." : continueLabel}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </Button>
        </footer>
      </main>
    </div>
  );
}
