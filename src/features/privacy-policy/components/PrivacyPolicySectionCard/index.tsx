"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { usePrivacyPolicySectionCardVM } from "./privacyPolicySectionCard.viewmodel";
import type { PrivacyPolicySectionCardProps } from "./privacyPolicySectionCard.types";

export function PrivacyPolicySectionCard(props: PrivacyPolicySectionCardProps) {
  const {
    id,
    headingId,
    number,
    icon,
    title,
    paragraphs,
    bullets,
    hasBullets,
  } = usePrivacyPolicySectionCardVM(props);

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-6 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm backdrop-blur-md md:p-8"
    >
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15"
        >
          <HugeiconsIcon icon={icon} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {number}
          </span>
          <h2
            id={headingId}
            className="mt-1 font-heading text-lg font-bold tracking-tight text-card-foreground md:text-xl"
          >
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground md:pl-15 md:text-[0.95rem]">
        {paragraphs.map((paragraph, index) => (
          <p key={`${id}-p-${index}`}>{paragraph}</p>
        ))}

        {hasBullets && (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/90">
            {bullets.map((bullet, index) => (
              <li key={`${id}-b-${index}`} className="leading-relaxed">
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export * from "./privacyPolicySectionCard.types";

