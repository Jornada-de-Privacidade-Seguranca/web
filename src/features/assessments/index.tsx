"use client";

import {
  RefreshIcon,
  AlertCircleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input, Message } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { useAssessmentsVM } from "./assessments.viewmodel";
import { Accordion } from "./components/Accordion";
import { JourneyCard } from "./components/JourneyCard";
import { JourneySkeleton } from "./components/JourneySkeleton";
import { Pagination } from "./components/Pagination";
import { EmptyState } from "./components/EmptyState";

export function AssessmentsView() {
  const {
    pendingJourneys,
    pendingPage,
    pendingTotalPages,
    isPendingLoading,
    isPendingSectionVisible,
    handlePendingPageChange,

    catalogJourneys,
    catalogPage,
    catalogTotalPages,
    isCatalogLoading,
    searchTerm,
    handleSearchChange,
    handleCatalogPageChange,

    error,
    serverMessage,
    onCloseMsg,
    handleRetry,
    labels,
  } = useAssessmentsVM();

  return (
    <PageShell title={labels.title} subtitle={labels.subtitle}>
      <div className="space-y-8">
        {/* Banner / Alerta do Servidor (se houver erro ou serverMessage) */}
        {serverMessage ? (
          <section role="alert" className="space-y-3">
            <Message
              title={serverMessage.title}
              description={serverMessage.description}
              variant={serverMessage.variant}
              onClose={onCloseMsg}
              icon={
                <HugeiconsIcon icon={AlertCircleIcon} size={20} className="shrink-0" />
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

        {/* Seção 1: Jornadas Pendentes (Accordion aberto por padrão) */}
        {isPendingSectionVisible && (
          <>
            <section aria-label={labels.pendingSectionTitle}>
              <Accordion
                title={labels.pendingSectionTitle}
                subtitle={labels.pendingSectionSubtitle}
                count={pendingJourneys.length}
                defaultOpen={true}
              >
                {isPendingLoading ? (
                  <JourneySkeleton count={3} />
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingJourneys.map((journey) => (
                        <JourneyCard
                          key={journey.id}
                          journey={journey}
                          labels={labels}
                        />
                      ))}
                    </div>

                    <Pagination
                      currentPage={pendingPage}
                      totalPages={pendingTotalPages}
                      onPageChange={handlePendingPageChange}
                      previousText={labels.paginationPrevious}
                      nextText={labels.paginationNext}
                      pageOfText={labels.paginationPageOf}
                    />
                  </div>
                )}
              </Accordion>
            </section>

            {/* Divisória sutil */}
            <hr className="my-8 border-border/60" />
          </>
        )}

        {/* Seção 2: Todas as Jornadas (Catálogo) */}
        <section aria-label={labels.catalogSectionTitle} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                {labels.catalogSectionTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {labels.catalogSectionSubtitle}
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
                placeholder={labels.catalogSearchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-11 rounded-full bg-card/80 border-border/80 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                aria-label={labels.catalogSearchPlaceholder}
              />
            </div>
          </div>

          {/* Lista de Jornadas do Catálogo */}
          {isCatalogLoading ? (
            <JourneySkeleton count={6} />
          ) : catalogJourneys.length === 0 ? (
            <EmptyState message={labels.catalogEmpty} />
          ) : (
            <div>
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
    </PageShell>
  );
}

export default AssessmentsView;
