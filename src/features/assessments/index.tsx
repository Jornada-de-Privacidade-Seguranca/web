"use client";

import {
  RefreshIcon,
  AlertCircleIcon,
  Search01Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useAssessmentsVM } from "./assessments.viewmodel";
import {
  PendingJourneyCard,
  JourneyCard,
  JourneyFilterPanel,
  CancelJourneyModal,
  JourneySkeleton,
  Pagination,
  EmptyState,
} from "./components";

export function AssessmentsView() {
  const {
    pendingJourney,
    hasPendingJourney,
    isPendingLoading,
    pendingError,
    handleRetryPending,

    isCancelModalOpen,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancelJourney,

    catalogJourneys,
    catalogPage,
    catalogTotalPages,
    isCatalogLoading,
    catalogError,
    searchTerm,
    handleSearchChange,
    handleCatalogPageChange,
    handleRetryCatalog,

    isFilterPanelOpen,
    handleToggleFilterPanel,
    activeFiltersCount,
    filters,
    handleToggleDomainFilter,
    handleToggleStatusFilter,
    handleClearFilters,

    labels,
  } = useAssessmentsVM();

  const filterButtonLabel =
    activeFiltersCount > 0
      ? labels.filtersButtonWithCount(activeFiltersCount)
      : labels.filtersButton;

  return (
    <PageShell title={labels.title} subtitle={labels.subtitle}>
      <div className="space-y-10">
        {/* Seção 1: Jornada Pendente em Destaque (No singular; NÃO aparece se não houver pendente) */}
        {(isPendingLoading || hasPendingJourney || pendingError) && (
          <section aria-labelledby="pending-journey-section-title" className="space-y-4">
            <div>
              <h2
                id="pending-journey-section-title"
                className="text-xl font-bold tracking-tight text-foreground font-heading"
              >
                {labels.pendingSectionTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {labels.pendingSectionSubtitle}
              </p>
            </div>

            {isPendingLoading ? (
              <JourneySkeleton count={1} />
            ) : pendingError ? (
              <div
                data-testid="pending-error-state"
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive"
              >
                <HugeiconsIcon icon={AlertCircleIcon} size={28} />
                <p className="text-sm font-medium">{pendingError}</p>
                <Button
                  onClick={handleRetryPending}
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/20 text-xs"
                >
                  <HugeiconsIcon icon={RefreshIcon} size={14} className="mr-1.5" />
                  {labels.retryButton}
                </Button>
              </div>
            ) : pendingJourney ? (
              <PendingJourneyCard
                journey={pendingJourney}
                labels={labels}
                onCancelJourney={handleOpenCancelModal}
              />
            ) : null}

            <hr className="my-8 border-border/60" />
          </section>
        )}

        {/* Seção 2: Todas as Jornadas (Catálogo com Busca e Filtros) */}
        <section aria-label={labels.catalogSectionTitle} className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                {labels.catalogSectionTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {labels.catalogSectionSubtitle}
              </p>
            </div>

            {/* Controles de Busca e Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="text"
                  placeholder={labels.catalogSearchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-11 rounded-full bg-card/80 border-border/80 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                  aria-label={labels.catalogSearchPlaceholder}
                />
              </div>

              <Button
                type="button"
                variant={activeFiltersCount > 0 ? "default" : "outline"}
                onClick={handleToggleFilterPanel}
                className="h-11 rounded-full px-5 text-sm font-semibold shrink-0"
                aria-expanded={isFilterPanelOpen}
                aria-label={labels.filtersButton}
              >
                <HugeiconsIcon icon={FilterHorizontalIcon} size={18} className="mr-2" />
                <span>{filterButtonLabel}</span>
              </Button>
            </div>
          </div>

          {/* Painel expansível de Filtros */}
          <JourneyFilterPanel
            isOpen={isFilterPanelOpen}
            filters={filters}
            labels={labels}
            onToggleDomain={handleToggleDomainFilter}
            onToggleStatus={handleToggleStatusFilter}
            onClearFilters={handleClearFilters}
          />

          {/* Grid do Catálogo de Jornadas */}
          {isCatalogLoading ? (
            <JourneySkeleton count={9} />
          ) : catalogError ? (
            <div
              data-testid="catalog-error-state"
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive"
            >
              <HugeiconsIcon icon={AlertCircleIcon} size={28} />
              <p className="text-sm font-medium">{catalogError}</p>
              <Button
                onClick={handleRetryCatalog}
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/20 text-xs"
              >
                <HugeiconsIcon icon={RefreshIcon} size={14} className="mr-1.5" />
                {labels.retryButton}
              </Button>
            </div>
          ) : catalogJourneys.length === 0 ? (
            <EmptyState message={labels.catalogEmpty} />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogJourneys.map((journey) => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    labels={labels}
                  />
                ))}
              </div>

              <Pagination
                currentPage={catalogPage}
                totalPages={catalogTotalPages}
                onPageChange={handleCatalogPageChange}
                previousText={labels.paginationPrevious}
                nextText={labels.paginationNext}
                pageOfText={labels.paginationPageOf}
              />
            </div>
          )}
        </section>
      </div>

      {/* Modal de Cancelamento de Jornada */}
      <CancelJourneyModal
        isOpen={isCancelModalOpen}
        title={labels.cancelModalTitle}
        description={labels.cancelModalDescription}
        keepLabel={labels.cancelModalKeep}
        confirmLabel={labels.cancelModalConfirm}
        onCancel={handleCloseCancelModal}
        onConfirm={handleConfirmCancelJourney}
      />
    </PageShell>
  );
}

export default AssessmentsView;
