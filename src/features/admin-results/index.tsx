"use client";

import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Pagination } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useAdminResultsVM } from "./adminResults.viewmodel";
import {
  AdminResultsFilters,
  AdminResultsSummary,
  AdminResultsTable,
} from "./components";

export function AdminResultsView() {
  const {
    summary,
    results,
    totalResults,
    filteredTotal,
    page,
    totalPages,
    isLoading,
    isError,
    errorMessage,
    hasActiveFilters,
    filters,
    filterOptions,
    handleSearchChange,
    handleUserChange,
    handleDepartmentChange,
    handleToggleDomain,
    handleProfileChange,
    handleDateFromChange,
    handleDateToChange,
    handleClearFilters,
    handlePageChange,
    handleRetry,
    labels,
  } = useAdminResultsVM();

  return (
    <PageShell title={labels.title} subtitle={labels.subtitle}>
      <div className="space-y-6">
        {!isError && (
          <AdminResultsSummary summary={summary} isLoading={isLoading} labels={labels} />
        )}

        <AdminResultsFilters
          filters={filters}
          filterOptions={filterOptions}
          filteredTotal={filteredTotal}
          totalResults={totalResults}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={handleSearchChange}
          onUserChange={handleUserChange}
          onDepartmentChange={handleDepartmentChange}
          onToggleDomain={handleToggleDomain}
          onProfileChange={handleProfileChange}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onClearFilters={handleClearFilters}
          labels={labels}
        />

        {isLoading ? (
          <div
            data-testid="admin-results-skeleton"
            aria-busy="true"
            aria-label={labels.loadingAriaLabel}
            className="h-64 animate-pulse rounded-3xl border border-border/50 bg-muted/40"
          />
        ) : isError ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center space-y-3 rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center"
          >
            <p className="font-heading text-sm font-bold text-destructive">{labels.errorTitle}</p>
            <p className="text-xs text-destructive/90">{errorMessage}</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <HugeiconsIcon icon={RefreshIcon} size={14} aria-hidden="true" className="mr-1.5" />
              {labels.retryButton}
            </Button>
          </div>
        ) : results.length === 0 ? (
          <div
            data-testid="admin-results-empty-state"
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center"
          >
            <h3 className="font-heading text-base font-bold text-foreground">
              {hasActiveFilters ? labels.emptyTitle : labels.emptyNoDataTitle}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {hasActiveFilters ? labels.emptyDescription : labels.emptyNoDataDescription}
            </p>
            {hasActiveFilters && (
              <Button
                type="button"
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
            <AdminResultsTable results={results} labels={labels} />

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
      </div>
    </PageShell>
  );
}

export default AdminResultsView;

