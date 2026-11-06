"use client";

import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Pagination,
} from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useAdminUsersVM } from "./adminUsers.viewmodel";
import {
  UserFilters,
  UsersTable,
  AccessProfilesTab,
} from "./components";
import type { AdminUsersTab } from "./adminUsers.types";

export function AdminUsersView() {
  const {
    currentTab,
    handleTabChange,

    users,
    totalUsers,
    filteredTotal,
    page,
    totalPages,
    handlePageChange,

    isLoading,
    isError,
    errorMessage,
    handleRetry,

    filters,
    availableDepartments,
    availableRoles,
    availableStatuses,
    handleSearchChange,
    handleDepartmentChange,
    handleRoleChange,
    handleStatusChange,
    handleClearFilters,
    hasActiveFilters,

    accessProfiles,
    isProfilesLoading,

    labels,
  } = useAdminUsersVM();

  return (
    <PageShell title={labels.title} subtitle={labels.subtitle}>
      <div className="space-y-6">
        <Tabs
          value={currentTab}
          onValueChange={(val) => handleTabChange(val as AdminUsersTab)}
          className="space-y-6"
        >
          {/* Seletor de Abas */}
          <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/60">
            <TabsTrigger
              value="users"
              className="rounded-xl px-5 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              {labels.tabUsers}
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="rounded-xl px-5 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              {labels.tabRoles}
            </TabsTrigger>
          </TabsList>

          {/* Aba 1: Usuários */}
          <TabsContent value="users" className="space-y-6">
            {/* Bloco de Filtros */}
            <UserFilters
              filters={filters}
              availableDepartments={availableDepartments}
              availableRoles={availableRoles}
              availableStatuses={availableStatuses}
              filteredTotal={filteredTotal}
              totalUsers={totalUsers}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={handleSearchChange}
              onDepartmentChange={handleDepartmentChange}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
              onClearFilters={handleClearFilters}
              labels={labels}
            />

            {/* Conteúdo da Tabela / Estados */}
            {isLoading ? (
              <div
                data-testid="users-skeleton"
                className="h-64 rounded-3xl border border-border/50 bg-muted/40 animate-pulse"
              />
            ) : isError ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
                <p className="text-sm font-medium text-destructive">
                  {errorMessage}
                </p>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <HugeiconsIcon icon={RefreshIcon} size={14} className="mr-1.5" />
                  {labels.retryButton}
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div
                data-testid="users-empty-state"
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center"
              >
                <h4 className="font-heading text-base font-bold text-foreground">
                  {labels.emptyTitle}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  {labels.emptyDescription}
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full"
                  >
                    {labels.emptyClearButton}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <UsersTable users={users} labels={labels} />

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  previousText={labels.paginationPrevious}
                  nextText={labels.paginationNext}
                  pageOfText={labels.paginationPageOf}
                />
              </div>
            )}
          </TabsContent>

          {/* Aba 2: Perfis de Acesso */}
          <TabsContent value="roles">
            <AccessProfilesTab
              profiles={accessProfiles}
              labels={labels}
              isLoading={isProfilesLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}

export default AdminUsersView;
