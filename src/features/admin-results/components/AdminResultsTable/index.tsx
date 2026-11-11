"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button, DomainBadge } from "@/components/ui";
import { useAdminResultsTableVM } from "./adminResultsTable.viewmodel";
import type { AdminResultsTableProps } from "./adminResultsTable.types";

export function AdminResultsTable(props: AdminResultsTableProps) {
  const { rows, labels } = useAdminResultsTableVM(props);

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-md backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="table">
          <thead className="border-b border-border/70 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-6 py-4">
                {labels.tableUser}
              </th>
              <th scope="col" className="hidden px-4 py-4 md:table-cell">
                {labels.tableDepartment}
              </th>
              <th scope="col" className="px-4 py-4">
                {labels.tableProfile}
              </th>
              <th scope="col" className="hidden px-4 py-4 sm:table-cell">
                {labels.tableDomain}
              </th>
              <th scope="col" className="hidden px-4 py-4 lg:table-cell">
                {labels.tableCompletedAt}
              </th>
              <th scope="col" className="px-4 py-4">
                {labels.tableScore}
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                {labels.tableActions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20"
                    >
                      {row.userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-heading font-semibold text-foreground">
                        {row.userName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.userEmail}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="hidden px-4 py-4 text-xs font-medium text-foreground md:table-cell">
                  {row.department}
                </td>

                <td className="px-4 py-4 text-xs font-semibold text-foreground">
                  {row.profileTitle}
                </td>

                <td className="hidden px-4 py-4 sm:table-cell">
                  <DomainBadge label={row.domainLabel} />
                </td>

                <td className="hidden px-4 py-4 text-xs text-muted-foreground lg:table-cell">
                  <time dateTime={row.completedAt}>{row.formattedDate}</time>
                </td>

                <td className="px-4 py-4">
                  <span
                    aria-label={row.scoreAriaLabel}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${row.scoreBadgeClasses}`}
                  >
                    {row.scoreText}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-border/80 px-3 text-xs font-semibold transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    <Link href={row.resultHref} aria-label={row.viewAriaLabel}>
                      <span>{labels.tableView}</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={14}
                        aria-hidden="true"
                        className="ml-1 shrink-0"
                      />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export * from "./adminResultsTable.types";

