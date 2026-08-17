"use client";

import {
  RefreshIcon,
  AlertCircleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input, Message } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useResultsVM } from "./results.viewmodel";
import { ResultsKPIs } from "./components/ResultsKPIs";
import { ResultCard } from "./components/ResultCard";
import { ResultsSkeleton } from "./components/ResultsSkeleton";
import { Pagination } from "./components/Pagination";
import { EmptyState } from "./components/EmptyState";

export function ResultsView() {
  const {
    metrics,
    isMetricsLoading,

    results,
    page,
    totalPages,
    isResultsLoading,
    searchTerm,
    handleSearchChange,
    handlePageChange,

    error,
    serverMessage,
    onCloseMsg,
    handleRetry,
    labels,
  } = useResultsVM();

  const isSearchEmpty = searchTerm.trim().length > 0;

  return (
    <PageShell title={labels.title} subtitle={labels.subtitle}>
      <div className="space-y-8">
        {/* Banner de Erro ou Alerta do Servidor */}
        {serverMessage ? (
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
            <div className="flex justify-end">
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
              >
                <HugeiconsIcon icon={RefreshIcon} size={14} className="mr-1.5" />
                {labels.retryButton}
              </Button>
            </div>
          </section>
        ) : error ? (
          <section
            role="alert"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive"
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon
                icon={AlertCircleIcon}
                size={24}
                className="shrink-0"
              />
              <div>
                <h2 className="font-semibold text-sm">{labels.errorTitle}</h2>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/20 shrink-0 text-xs"
            >
              <HugeiconsIcon icon={RefreshIcon} size={14} className="mr-1.5" />
              {labels.retryButton}
            </Button>
          </section>
        ) : null}

        {/* Seção 1: Painel de Métricas (KPIs no topo) */}
        <section aria-label={labels.title}>
          <ResultsKPIs
            metrics={metrics}
            isLoading={isMetricsLoading}
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

            {/* Input de Busca */}
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
          </div>

          {/* Conteúdo da Listagem */}
          {isResultsLoading ? (
            <ResultsSkeleton count={6} />
          ) : results.length === 0 ? (
            <EmptyState
              message={isSearchEmpty ? labels.searchEmpty : labels.userEmpty}
            />
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} labels={labels} />
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
