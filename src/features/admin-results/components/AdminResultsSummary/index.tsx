"use client";

import { MetricsGrid } from "@/components/ui";
import { useAdminResultsSummaryVM } from "./adminResultsSummary.viewmodel";
import type { AdminResultsSummaryProps } from "./adminResultsSummary.types";

export function AdminResultsSummary(props: AdminResultsSummaryProps) {
  const { items, isLoading, ariaLabel, loadingLabel } = useAdminResultsSummaryVM(props);

  return (
    <section aria-label={ariaLabel} data-testid="admin-results-summary">
      <MetricsGrid
        items={items}
        isLoading={isLoading}
        loadingLabel={loadingLabel}
        className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
      />
    </section>
  );
}

export * from "./adminResultsSummary.types";

