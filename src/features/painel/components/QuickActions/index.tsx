"use client";

import {
  PlayIcon,
  Award01Icon,
  UserIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { useQuickActionsVM } from "./quickActions.viewmodel";
import type { QuickActionsProps } from "./quickActions.types";

const ICONS_BY_NAME = {
  play: PlayIcon,
  award: Award01Icon,
  user: UserIcon,
};

export function QuickActions(props: QuickActionsProps) {
  const { title, sectionAriaLabel, actions } = useQuickActionsVM(props);

  return (
    <section aria-label={sectionAriaLabel} className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const IconComponent = ICONS_BY_NAME[action.iconName] ?? PlayIcon;

          return (
            <Link
              key={action.id}
              href={action.href}
              className="group relative flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-card/80 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <HugeiconsIcon icon={IconComponent} size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {action.description}
                  </p>
                </div>
              </div>

              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={18}
                className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0 ml-2"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

