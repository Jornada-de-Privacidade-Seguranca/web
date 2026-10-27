"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/shared/lib/utils";
import { useCollapsibleSectionVM } from "./collapsibleSection.viewmodel";
import type { CollapsibleSectionProps } from "./collapsibleSection.types";

/**
 * Seção com título que abre e fecha o conteúdo. O botão fica dentro do
 * heading, e o conteúdo é uma região rotulada pelo próprio botão.
 */
export function CollapsibleSection({
  title,
  eyebrow,
  headingLevel = 2,
  defaultOpen = true,
  variant = "card",
  testId,
  children,
}: CollapsibleSectionProps) {
  const { isOpen, buttonId, contentId, handleToggle } = useCollapsibleSectionVM({ defaultOpen });
  const Heading = `h${headingLevel}` as const;
  const isNested = variant === "nested";

  return (
    <section
      data-testid={testId}
      className={cn(
        isNested
          ? "rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
          : "rounded-[2rem] border border-border bg-card/90 p-6 shadow-md backdrop-blur-xl md:p-8"
      )}
    >
      {eyebrow && (
        <p className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <Heading className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={handleToggle}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg text-left text-foreground",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            isNested ? "py-1 text-sm font-semibold" : "font-heading text-xl font-bold tracking-tight"
          )}
        >
          <span className="min-w-0">{title}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={20}
            aria-hidden="true"
            className={cn(
              "shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
              !isOpen && "-rotate-90"
            )}
          />
        </button>
      </Heading>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className={isNested ? "mt-3" : "mt-5"}
      >
        {children}
      </div>
    </section>
  );
}

export * from "./collapsibleSection.types";
