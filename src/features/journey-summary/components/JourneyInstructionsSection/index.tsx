"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useJourneyInstructionsSectionVM } from "./journeyInstructionsSection.viewmodel";
import type { JourneyInstructionsSectionProps } from "./journeyInstructionsSection.types";

/** Instruções do questionário de competências, exibidas no resumo antes de iniciar. */
export function JourneyInstructionsSection(props: JourneyInstructionsSectionProps) {
  const { title, intro, items, itemsAriaLabel, tip } = useJourneyInstructionsSectionVM(props);

  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card/90 p-8 shadow-md backdrop-blur-xl">
      <div>
        <h2 className="font-heading text-xl font-bold tracking-tight text-card-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
          {intro}
        </p>
      </div>

      <ul aria-label={itemsAriaLabel} className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={item.icon} size={18} aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-sm font-medium text-card-foreground">{item.title}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <aside className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90">
        {tip}
      </aside>
    </section>
  );
}
