"use client";

import { RefreshIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Message, MetricsGrid } from "@/components/ui";
import { PageShell } from "@/components/layout/PageShell";
import { usePainelVM } from "./painel.viewmodel";
import {
  WelcomeSummary,
  QuickActions,
  CurrentJourneyCard,
  LastCompletedCard,
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
    currentJourneyQuestionsText,
    currentJourneyTimeText,
    lastCompletedAssessment,
    history,
    metricsItems,
    hasMetrics,
    quickActions,
    isLoading,
    error,
    canRetry,
    accessDeniedMessage,
    handleDismissAccessDenied,
    handleRetry,
    labels,
  } = usePainelVM();

  return (
    <PageShell title={labels.pageTitle} subtitle="">
      <div className="space-y-8">
        {/* Alerta de Acesso Negado */}
        {accessDeniedMessage && (
          <Message
            variant="destructive"
            title={labels.accessDeniedTitle}
            description={accessDeniedMessage}
            onClose={handleDismissAccessDenied}
          />
        )}

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
            {canRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/20 shrink-0"
              >
                <HugeiconsIcon icon={RefreshIcon} size={16} className="mr-2" />
                {labels.retryButton}
              </Button>
            )}
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
                  exploreCtaText={labels.startFirstJourneyCta}
                  startCtaText={labels.startAssessment}
                  continueCtaText={labels.continueAssessment}
                  questionsText={currentJourneyQuestionsText}
                  timeText={currentJourneyTimeText}
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
                  sectionTitle={labels.completedSectionTitle}
                  viewAllResultsText={labels.viewAllResults}
                />
              </section>
            </div>

            {/* Métricas e Indicadores Rápidos */}
            {hasMetrics && (
              <section
                aria-label={labels.metricsSectionAriaLabel}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {labels.metricsSectionTitle}
                </h2>
                <MetricsGrid
                  items={metricsItems}
                  className="grid-cols-1 sm:grid-cols-3 md:grid-cols-3"
                />
              </section>
            )}

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
