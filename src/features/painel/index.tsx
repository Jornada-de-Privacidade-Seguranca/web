"use client";

import { RefreshIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { usePainelVM } from "./painel.viewmodel";
import {
  WelcomeSummary,
  QuickActions,
  CurrentJourneyCard,
  LastCompletedCard,
  MetricsGrid,
  RecentHistory,
} from "./components";

export function PainelView() {
  const {
    userFirstName,
    userRoleName,
    userOrganization,
    greetingTitle,
    greetingSubtitle,
    currentJourney,
    lastCompletedAssessment,
    history,
    metrics,
    quickActions,
    isLoading,
    error,
    handleRetry,
    labels,
  } = usePainelVM();

  return (
    <PageShell title={labels.pageTitle} subtitle="">
      <div className="space-y-8">
        {/* Cartão de Boas-Vindas / Resumo */}
        <WelcomeSummary
          userName={userFirstName}
          userRole={userRoleName}
          organization={userOrganization}
          greetingTitle={greetingTitle}
          greetingSubtitle={greetingSubtitle}
          organizationLabelText={labels.organizationLabel}
        />

        {/* Exibição de Erro com botão de Tentar Novamente */}
        {error && (
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
            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-20 rounded-2xl bg-muted/60 border border-border/40" />
              <div className="h-20 rounded-2xl bg-muted/60 border border-border/40" />
              <div className="h-20 rounded-2xl bg-muted/60 border border-border/40" />
            </div>

            {/* Journey Status Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-72 rounded-[2rem] bg-muted/60 border border-border/40" />
              <div className="h-72 rounded-[2rem] bg-muted/60 border border-border/40" />
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-28 rounded-2xl bg-muted/60 border border-border/40" />
              <div className="h-28 rounded-2xl bg-muted/60 border border-border/40" />
              <div className="h-28 rounded-2xl bg-muted/60 border border-border/40" />
            </div>

            {/* History Skeleton */}
            <div className="h-64 rounded-[2rem] bg-muted/60 border border-border/40" />
          </div>
        ) : (
          /* Conteúdo Principal do Painel */
          <div className="space-y-8">
            {/* Atalhos Rápidos */}
            <QuickActions
              title={labels.quickActionsTitle}
              sectionAriaLabel={labels.quickActionsSectionAriaLabel}
              actions={quickActions}
            />

            {/* Grid 2 colunas: Status da Jornada Atual & Última Conclusão */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section
                aria-label={labels.currentJourneySectionAriaLabel}
                className="flex flex-col"
              >
                <h2 className="sr-only">
                  {labels.currentJourneySectionTitle}
                </h2>
                <CurrentJourneyCard
                  journey={currentJourney}
                  sectionTitle={labels.currentJourneySectionTitle}
                  emptyMessage={labels.currentJourneyEmpty}
                  exploreCtaText={labels.startNewJourneyCta}
                  continueCtaText={labels.continueJourneyCta}
                  progressLabel={labels.progressLabel}
                  progressPercentLabel={labels.progressPercentLabel}
                  badgeLabel={
                    currentJourney?.status === "in_progress"
                      ? labels.badgeInProgress
                      : labels.badgePending
                  }
                  badgeVariant={
                    currentJourney?.status === "in_progress"
                      ? "in_progress"
                      : "pending"
                  }
                />
              </section>

              <section
                aria-label={labels.completedSectionAriaLabel}
                className="flex flex-col"
              >
                <h2 className="sr-only">{labels.completedSectionTitle}</h2>
                <LastCompletedCard
                  assessment={lastCompletedAssessment}
                  emptyMessage={labels.completedEmpty}
                />
              </section>
            </div>

            {/* Métricas e Indicadores Rápidos */}
            <MetricsGrid
              metrics={metrics}
              sectionTitle={labels.metricsSectionTitle}
              sectionAriaLabel={labels.metricsSectionAriaLabel}
              completedTitle={labels.metricsCompletedTitle}
              completedSubtitle={labels.metricsCompletedSubtitle}
              pendingTitle={labels.metricsPendingTitle}
              pendingSubtitle={labels.metricsPendingSubtitle}
              averageScoreTitle={labels.metricsAverageScoreTitle}
              averageScoreSubtitle={labels.metricsAverageScoreSubtitle}
            />

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
      </div>
    </PageShell>
  );
}

export default PainelView;
