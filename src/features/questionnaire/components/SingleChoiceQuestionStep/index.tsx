"use client";

import { useRef } from "react";
import type React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@components/ui";
import { cn } from "@/shared/lib/utils";
import { StepHeader } from "../StepHeader";
import { useSingleChoiceQuestionStepVM } from "./singleChoiceQuestionStep.viewmodel";
import type { SingleChoiceQuestionStepProps } from "./singleChoiceQuestionStep.types";

/**
 * @deprecated Etapa de escolha única usada pelas telas do pré-questionário (experiência profissional, inglês e tempo de atuação no perfil), que saíram do fluxo da jornada. Mantida para reaproveitamento futuro; não é usada por nenhuma tela.
 */
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
    backAriaLabel,
    continueLabel = "Continuar",
    savingLabel,
    exitLabel = "Sair",
    exitAriaLabel = "Sair da etapa",
    canContinue,
  } = useSingleChoiceQuestionStepVM(props);

  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    if (options.length === 0) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelectOption(options[index].id);
      return;
    }

    let nextIndex: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (index + 1) % options.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (index - 1 + options.length) % options.length;
    }

    if (nextIndex !== null) {
      onSelectOption(options[nextIndex].id);
      optionRefs.current[nextIndex]?.focus();
    }
  };

  const hasSelectedOption = options.some((opt) => opt.id === selectedOption);

  return (
    <div className="flex min-h-full w-full flex-col bg-background text-foreground">
      <StepHeader
        stepTag={stepTag}
        journeyTitle={journeyTitle}
        onExit={onExit}
        exitLabel={exitLabel}
        exitAriaLabel={exitAriaLabel}
      />

      {/* Conteúdo principal */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12">
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
            {questionLabel && (
              <h2 className="font-heading text-base font-semibold text-card-foreground md:text-lg">
                {questionLabel}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div
            role="radiogroup"
            aria-label={questionLabel || title}
            className="space-y-3"
          >
            {options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              const isFocusable =
                isSelected || (!hasSelectedOption && index === 0);

              return (
                <div
                  key={option.id}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isFocusable ? 0 : -1}
                  onClick={() => onSelectOption(option.id)}
                  onKeyDown={(e) => handleOptionKeyDown(e, index)}
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

          <Button
            onClick={onContinue}
            disabled={!canContinue}
            className="gap-2 px-6"
          >
            <span>
              {isSubmitting ? (savingLabel ?? continueLabel) : continueLabel}
            </span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </Button>
        </footer>
      </div>
    </div>
  );
}
