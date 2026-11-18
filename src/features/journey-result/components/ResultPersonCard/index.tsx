"use client";

import { useResultPersonCardVM } from "./resultPersonCard.viewmodel";
import type { ResultPersonCardProps } from "./resultPersonCard.types";

/** Identifica de quem é o resultado, quando o admin consulta a jornada de outra pessoa. */
export function ResultPersonCard(props: ResultPersonCardProps) {
  const { ariaLabel, initials, name, email, fields } = useResultPersonCardVM(props);

  return (
    <section
      aria-label={ariaLabel}
      data-testid="result-person-card"
      className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-md backdrop-blur-xl md:p-8"
    >
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/15 text-base font-semibold text-primary"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold text-card-foreground">{name}</p>
          {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {fields.map((field) => (
          <div key={field.id} className="min-w-0">
            <dt className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {field.label}
            </dt>
            <dd className="truncate text-sm font-medium text-card-foreground" title={field.value}>
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export * from "./resultPersonCard.types";
