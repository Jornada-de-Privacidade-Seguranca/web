"use client";

import { RefreshIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui";
import { usePainelVM } from "./painel.viewmodel";
import { PendingAssessmentCard } from "./components/PendingAssessmentCard";
import { LastCompletedCard } from "./components/LastCompletedCard";
import { RecentHistory } from "./components/RecentHistory";

export function PainelView() {
  const {
    greetingTitle,
    greetingSubtitle,
    pendingAssessment,
    lastCompletedAssessment,
    history,
    isLoading,
    error,
    handleRetry,
    labels,
  } = usePainelVM();

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* Header com saudação */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {greetingTitle}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {greetingSubtitle}
        </p>
      </header>

      {/* Exibição de Erro com botão de Tentar Novamente */}
      {error && (
        <section
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive"
        >
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} size={24} className="shrink-0" />
            <div>
              <h2 className="font-semibold text-sm">{labels.errorTitle}</h2>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/20 shrink-0"
          >
            <HugeiconsIcon icon={RefreshIcon} size={16} className="mr-2" />
            {labels.retryButton}
          </Button>
        </section>
      )}

      {/* Estado de Carregamento (Skeleton) */}
      {isLoading ? (
        <div
          aria-busy="true"
          aria-label={labels.loadingAriaLabel}
          className="space-y-8 animate-pulse"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 rounded-[2rem] bg-muted/60 border border-border/40" />
            <div className="h-64 rounded-[2rem] bg-muted/60 border border-border/40" />
          </div>
          <div className="h-72 rounded-[2rem] bg-muted/60 border border-border/40" />
        </div>
      ) : (
        /* Conteúdo Principal do Painel */
        <div className="space-y-8">
          {/* Seções em Destaque: Avaliação Pendente & Última Concluída */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section aria-label={labels.pendingSectionAriaLabel} className="flex flex-col">
              <h2 className="sr-only">{labels.pendingSectionTitle}</h2>
              <PendingAssessmentCard
                assessment={pendingAssessment}
                emptyMessage={labels.pendingEmpty}
              />
            </section>

            <section aria-label={labels.completedSectionAriaLabel} className="flex flex-col">
              <h2 className="sr-only">{labels.completedSectionTitle}</h2>
              <LastCompletedCard
                assessment={lastCompletedAssessment}
                emptyMessage={labels.completedEmpty}
              />
            </section>
          </div>

          {/* Histórico Recente */}
          <section aria-label={labels.historySectionAriaLabel}>
            <RecentHistory
              history={history}
              emptyMessage={labels.historyEmpty}
              sectionTitle={labels.historySectionTitle}
            />
          </section>
        </div>
      )}
    </main>
  );
}

export default PainelView;
