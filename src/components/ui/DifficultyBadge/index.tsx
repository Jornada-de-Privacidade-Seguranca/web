import { cn } from "@/shared/lib/utils";
import { useDifficultyBadgeVM } from "./difficultyBadge.viewmodel";
import type { DifficultyBadgeProps } from "./difficultyBadge.types";

/**
 * Badge do nível de dificuldade de uma competência. A cor depende do nível,
 * mas o texto também é lido pelo leitor de tela (ex.: "Nível: Básico").
 */
export function DifficultyBadge(props: DifficultyBadgeProps) {
  const { label, srPrefix, colorClassName, className } = useDifficultyBadgeVM(props);

  return (
    <span
      data-slot="difficulty-badge"
      data-testid="difficulty-badge"
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1",
        colorClassName,
        className
      )}
    >
      {srPrefix && <span className="sr-only">{`${srPrefix}: `}</span>}
      {label}
    </span>
  );
}

export * from "./difficultyBadge.types";
