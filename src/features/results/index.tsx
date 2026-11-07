"use client";

import {
  RefreshIcon,
  AlertCircleIcon,
  Search01Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input, Message } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useResultsVM } from "./results.viewmodel";
import {
  ResultsKPIs,
  ResultCard,
  ResultsFilterPanel,
  ResultsSkeleton,
  Pagination,
  ResultsEmptyState,
} from "./components";

export function ResultsView() {
  const {
    metrics,
    isMetricsLoading,
    isMetricsError,

    results,
    page,
    totalPages,
    isResultsLoading,
    isResultsError,
    resultsErrorMessage,
    emptyState,

    searchTerm,
    handleSearchChange,
    handlePageChange,

    isFilterPanelOpen,
    handleToggleFilterPanel,
    activeFiltersCount,
    filters,
    handleToggleDomainFilter,
    handleClearFilters,

    serverMessage,
    onCloseMsg,
    handleRetry,
    labels,
  } = useResultsVM();

  const filterButtonLabel =
    activeFiltersCount > 0
      ? labels.filtersButtonWithCount(activeFiltersCount)
      : labels.filtersButton;

  return (
    <PageShell title={labels.title} subtitle={labels.subtitle}>
      <div className="space-y-8">
        {/* Banner de Mensagem do Servidor */}
        {serverMessage && (
          <section role="alert" className="space-y-3">
            <Message
              title={serverMessage.title}
              description={serverMessage.description}
              variant={serverMessage.variant}
              onClose={onCloseMsg}
              icon={
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  size={20}
                  className="shrink-0"
                />
              }
            />
          </section>
        )}

        {/* Seção 1: Painel de Métricas (KPIs no topo) */}
        <section aria-label={labels.title}>
          <ResultsKPIs
            metrics={metrics}
            isLoading={isMetricsLoading}
            isError={isMetricsError}
            onRetry={handleRetry}
            labels={labels}
          />
        </section>

        {/* Seção 2: Jornadas Concluídas (Listagem Detalhada) */}
        <section aria-label={labels.sectionTitle} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                {labels.sectionTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {labels.sectionSubtitle}
              </p>
            </div>

            {/* Controles de Busca e Filtros (Ocultos apenas quando o usuário não possui nenhuma jornada concluída) */}
            {emptyState !== "no-results" && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder={labels.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-11 rounded-full bg-card/80 border-border/80 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                    aria-label={labels.searchPlaceholder}
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
                  <HugeiconsIcon
                    icon={FilterHorizontalIcon}
                    size={18}
                    className="mr-2"
                  />
                  <span>{filterButtonLabel}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Painel expansível de Filtros */}
          <ResultsFilterPanel
            isOpen={isFilterPanelOpen}
            filters={filters}
            labels={labels}
            onToggleDomain={handleToggleDomainFilter}
            onClearFilters={handleClearFilters}
          />

          {/* Conteúdo da Listagem */}
          {isResultsLoading ? (
            <ResultsSkeleton count={6} />
          ) : isResultsError ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-destructive/30 bg-destructive/5 p-8 text-center">
              <p className="text-sm font-medium text-destructive mb-3">
                {resultsErrorMessage}
              </p>
              <Button onClick={handleRetry} variant="outline" size="sm">
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={14}
                  className="mr-1.5"
                />
                {labels.retryButton}
              </Button>
            </div>
          ) : emptyState !== "none" ? (
            <ResultsEmptyState
              mode={emptyState}
              title={
                emptyState === "no-search-matches"
                  ? labels.searchEmptyTitle
                  : labels.userEmptyTitle
              }
              description={
                emptyState === "no-search-matches"
                  ? labels.searchEmpty
                  : labels.userEmpty
              }
              ctaText={
                emptyState === "no-results"
                  ? labels.availableJourneysCta
                  : undefined
              }
              ctaHref={emptyState === "no-results" ? "/jornadas" : undefined}
            />
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    labels={labels}
                  />
                ))}
              </div>

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
        </section>
      </div>
    </PageShell>
  );
}

export default ResultsView;
