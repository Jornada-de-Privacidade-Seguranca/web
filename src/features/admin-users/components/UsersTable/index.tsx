"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/components/ui";
import { useUsersTableVM } from "./usersTable.viewmodel";
import type { UsersTableProps } from "./usersTable.types";

export function UsersTable(props: UsersTableProps) {
  const { rows, labels } = useUsersTableVM(props);

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-md backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="table">
          <thead className="border-b border-border/70 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4">
                {labels.tableUser}
              </th>
              <th scope="col" className="px-4 py-4 hidden md:table-cell">
                {labels.tableEmployeeCode}
              </th>
              <th scope="col" className="px-4 py-4 hidden sm:table-cell">
                {labels.tableDepartment}
              </th>
              <th scope="col" className="px-4 py-4">
                {labels.tableRole}
              </th>
              <th scope="col" className="px-4 py-4">
                {labels.tableStatus}
              </th>
              <th scope="col" className="px-4 py-4 text-center hidden lg:table-cell">
                {labels.tableJourneys}
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                {labels.tableActions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-muted/30"
              >
                {/* Coluna 1: Usuário (Avatar, Iniciais, Nome e E-mail) */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20"
                    >
                      {row.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-semibold text-foreground truncate">
                        {row.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {row.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Coluna 2: Código */}
                <td className="px-4 py-4 hidden md:table-cell text-xs font-mono text-muted-foreground">
                  {row.employeeCode}
                </td>

                {/* Coluna 3: Setor */}
                <td className="px-4 py-4 hidden sm:table-cell text-xs font-medium text-foreground">
                  {row.department}
                </td>

                {/* Coluna 4: Perfil de Acesso */}
                <td className="px-4 py-4 text-xs font-semibold text-foreground">
                  {row.roleLabel}
                </td>

                {/* Coluna 5: Situação (Badge com cor) */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${row.statusColorClasses}`}
                  >
                    {row.statusLabel}
                  </span>
                </td>

                {/* Coluna 6: Quantidade de Jornadas */}
                <td className="px-4 py-4 text-center hidden lg:table-cell text-xs font-semibold text-foreground">
                  {row.journeysCount}
                </td>

                {/* Coluna 7: Ação Gerenciar */}
                <td className="px-6 py-4 text-right">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-border/80 px-3 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Link
                      href={row.manageHref}
                      aria-label={`${labels.tableManage} ${row.name}`}
                    >
                      <span>{labels.tableManage}</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={14}
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

export * from "./usersTable.types";
