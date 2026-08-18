"use client";

import { useId } from "react";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAccordionVM } from "./accordion.viewmodel";
import type { AccordionProps } from "./accordion.types";

export function Accordion(props: AccordionProps) {
  const { title, subtitle, count, isOpen, toggle, children } = useAccordionVM(props);
  const baseId = useId();
  const headerId = `accordion-header-${baseId}`;
  const contentId = `accordion-content-${baseId}`;

  return (
    <div data-testid="pending-accordion" className="space-y-4">
      <button
        type="button"
        id={headerId}
        onClick={toggle}
        role="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        data-testid="accordion-trigger"
        className="flex w-full items-center justify-between gap-4 text-left font-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1 transition-colors hover:bg-muted/30"
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            {typeof count === "number" && count > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                {count}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <HugeiconsIcon icon={ChevronDownIcon} size={20} />
        </div>
      </button>

      {isOpen && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
        >
          {children}
        </div>
      )}
    </div>
  );
}
