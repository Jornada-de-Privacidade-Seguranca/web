"use client";

import { usePrivacyPolicyTocVM } from "./privacyPolicyToc.viewmodel";
import type { PrivacyPolicyTocProps } from "./privacyPolicyToc.types";

export function PrivacyPolicyToc(props: PrivacyPolicyTocProps) {
  const { title, sections } = usePrivacyPolicyTocVM(props);

  return (
    <nav
      aria-label={title}
      className="rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur-md md:p-6"
    >
      <h2 className="font-heading text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h2>
      <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex items-center gap-2.5 rounded-2xl border border-border/50 bg-background/60 px-3.5 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <span className="font-mono text-[11px] font-bold text-primary">
                {section.number}
              </span>
              <span className="truncate">{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export * from "./privacyPolicyToc.types";

