"use client";

import { useHowItWorksSectionVM } from "./howItWorksSection.viewmodel";
import type { HowItWorksSectionProps } from "./howItWorksSection.types";

export function HowItWorksSection(props: HowItWorksSectionProps) {
  const { title, subtitle, steps } = useHowItWorksSectionVM(props);

  return (
    <section className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-md backdrop-blur-xl">
      <h2 className="font-heading text-xl font-bold tracking-tight text-card-foreground">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

      <ol className="mt-6 space-y-5">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {index + 1}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">
                {step.title}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
