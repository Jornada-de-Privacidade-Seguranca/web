import { useEmptyStateVM } from "./emptyState.viewmodel";
import type { EmptyStateProps } from "./emptyState.types";

export function EmptyState(props: EmptyStateProps) {
  const { message, className = "" } = useEmptyStateVM(props);

  return (
    <div
      className={`flex min-h-[130px] w-full items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-card/40 p-6 text-center shadow-sm backdrop-blur-sm ${className}`}
    >
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
