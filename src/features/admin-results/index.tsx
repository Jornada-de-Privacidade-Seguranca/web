"use client";

import { Button, Pagination } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useAdminResultsVM } from "./adminResults.viewmodel";
import {
  AdminResultsErrorState,
  AdminResultsFilters,
  AdminResultsSummary,
  AdminResultsTable,
} from "./components";

export function AdminResultsView() {
  const {
    summary,
    results,
    listQuery,
    totalResults,
    filteredTotal,
    page,
    totalPages,
    isResultsLoading,
    isResultsError,
    isSummaryLoading,
    isSummaryError,
    isFilterOptionsLoading,
    isFilterOptionsError,
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
    handleRetryResults,
    handleRetrySummary,
    handleRetryFilterOptions,
    labels,
  } = useAdminResultsVM();

  return (
    <PageShell title={labels.title} subtitle={labels.subtitle}>
      <div className="space-y-6">
        {isSummaryError ? (
          <AdminResultsErrorState
            testId="admin-results-summary-error"
            title={labels.errorTitle}
            message={labels.summaryErrorMessage}
            retryLabel={labels.retryButton}
            onRetry={handleRetrySummary}
          />
        ) : (
          <AdminResultsSummary summary={summary} isLoading={isSummaryLoading} labels={labels} />
        )}

        <AdminResultsFilters
          filters={filters}
          filterOptions={filterOptions}
          filteredTotal={filteredTotal}
          totalResults={totalResults}
          hasActiveFilters={hasActiveFilters}
          isOptionsLoading={isFilterOptionsLoading}
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

        {isFilterOptionsError && (
          <AdminResultsErrorState
            testId="admin-results-filter-options-error"
            title={labels.errorTitle}
            message={labels.filterOptionsErrorMessage}
            retryLabel={labels.retryButton}
            onRetry={handleRetryFilterOptions}
          />
        )}

        {isResultsLoading ? (
          <div
            data-testid="admin-results-skeleton"
            aria-busy="true"
            aria-label={labels.loadingAriaLabel}
            className="h-64 animate-pulse rounded-3xl border border-border/50 bg-muted/40"
          />
        ) : isResultsError ? (
          <AdminResultsErrorState
            testId="admin-results-list-error"
            title={labels.errorTitle}
            message={labels.errorMessage}
            retryLabel={labels.retryButton}
            onRetry={handleRetryResults}
          />
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
            <AdminResultsTable results={results} labels={labels} listQuery={listQuery} />

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

