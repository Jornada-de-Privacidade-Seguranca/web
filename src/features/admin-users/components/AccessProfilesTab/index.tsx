"use client";

import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAccessProfilesTabVM } from "./accessProfilesTab.viewmodel";
import type { AccessProfilesTabProps } from "./accessProfilesTab.types";

export function AccessProfilesTab(props: AccessProfilesTabProps) {
  const { profiles, labels, isLoading } = useAccessProfilesTabVM(props);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 rounded-3xl border border-border/40 bg-muted/40 p-6"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header explicativo da aba */}
      <div>
        <h3 className="font-heading text-lg font-bold text-foreground">
          {labels.rolesTitle}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {labels.rolesSubtitle}
        </p>
      </div>

      {/* Grid de Cards de Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <article
            key={profile.id}
            className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-3 min-h-[28px]">
                <h4 className="font-heading text-base font-bold text-foreground">
                  {profile.name}
                </h4>
                {profile.isDefault && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/20">
                    {labels.rolesDefaultBadge}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {profile.description}
              </p>

              <div className="mt-5 border-t border-border/50 pt-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {labels.rolesPermissionsTitle}
                </p>
                <ul className="space-y-2 text-xs text-foreground/90">
                  {profile.permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={16}
                        className="text-primary shrink-0 mt-0.5"
                      />
                      <span className="leading-tight">{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Caixa Informativa sobre Histórico e Auditoria */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex items-center gap-3">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={20}
          className="text-primary shrink-0"
        />
        <p className="leading-relaxed">{labels.rolesHistoryNotice}</p>
      </div>
    </div>
  );
}

export * from "./accessProfilesTab.types";
