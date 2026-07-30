"use client";

import { EmptyState } from "../EmptyState";
import { useRecentHistoryVM } from "./recentHistory.viewmodel";
import type { RecentHistoryProps } from "./recentHistory.types";

export function RecentHistory(props: RecentHistoryProps) {
  const { history, emptyMessage, sectionTitle, hasHistory } =
    useRecentHistoryVM(props);

  if (!hasHistory) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <section className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-xl backdrop-blur-xl">
      <h3 className="mb-6 font-heading text-lg font-bold tracking-tight text-card-foreground">
        {sectionTitle}
      </h3>

      <div className="space-y-5">
        {history.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col gap-2.5 rounded-2xl border border-border/40 bg-card/40 p-4 transition-all hover:border-border hover:bg-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {item.title}
              </h4>
              <div className="flex items-center gap-3 text-xs">
                <time
                  dateTime={item.completedAt}
                  className="font-medium text-muted-foreground"
                >
                  {item.formattedDate}
                </time>
                <span className="rounded-md bg-muted px-2 py-0.5 font-bold text-foreground">
                  {item.score} / 100
                </span>
              </div>
            </div>

            <div
              role="progressbar"
              aria-valuenow={item.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={item.ariaLabel}
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
                style={{ width: `${item.progressPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
