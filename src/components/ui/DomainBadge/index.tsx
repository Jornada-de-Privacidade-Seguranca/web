import { cn } from "@/shared/lib/utils";
import { useDomainBadgeVM } from "./domainBadge.viewmodel";
import type { DomainBadgeProps } from "./domainBadge.types";

/**
 * Badge do domínio de conhecimento de uma competência (Privacidade, Segurança
 * da Informação ou Conjunta). Usa só contorno, para não ser confundido com o
 * badge de dificuldade, que é preenchido.
 */
export function DomainBadge(props: DomainBadgeProps) {
  const { isVisible, label, srPrefix, className } = useDomainBadgeVM(props);

  if (!isVisible) return null;

  return (
    <span
      data-testid="domain-badge"
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {srPrefix && <span className="sr-only">{`${srPrefix}: `}</span>}
      {label}
    </span>
  );
}

export * from "./domainBadge.types";
