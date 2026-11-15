"use client";

import { PageShell } from "@components/layout/PageShell";
import { useJourneyResultVM } from "./journeyResult.viewmodel";
import { AreaScoreSection } from "./components/AreaScoreSection";
import { CompetencyAnswerBox } from "./components/CompetencyAnswerBox";
import { JourneyResultErrorState } from "./components/JourneyResultErrorState";
import { JourneyResultSkeleton } from "./components/JourneyResultSkeleton";
import { ScoreSummaryCard } from "./components/ScoreSummaryCard";
import type { JourneyResultViewProps } from "./journeyResult.types";

export function JourneyResultView({ journeyId }: JourneyResultViewProps) {
  const {
    journeyTitle,
    score,
    isJointJourney,
    areaScoreGroups,
    declaredCompetencies,
    undeclaredCompetencies,
    retakeUrl,
    resultsUrl,
    recommendedAreaScore,
    isLoading,
    error,
    labels,
    handleRetry,
    canDownloadPdf,
    isDownloadingPdf,
    pdfError,
    handleDownloadPdf,
  } = useJourneyResultVM(journeyId);

  return (
    <PageShell title={labels.pageTitle} subtitle={error ? undefined : journeyTitle || undefined}>
      {labels.errors ? (
        <JourneyResultErrorState
          title={labels.errors.title}
          message={labels.errors.message}
          linkText={labels.errors.linkText}
          linkHref={labels.errors.linkHref}
          retryLabel={labels.errors.retryButton}
          onRetry={handleRetry}
        />
      ) : (
        <div
          aria-busy={isLoading}
          aria-label={isLoading ? labels.loadingAriaLabel : undefined}
          role={isLoading ? "status" : undefined}
          data-testid="journey-result-content"
        >
          {isLoading ? (
            <JourneyResultSkeleton />
          ) : (
            <div className="space-y-6">
              <ScoreSummaryCard
                journeyTitle={journeyTitle}
                score={score}
                overallLabel={labels.overallLabel}
                scoreAriaLabel={labels.overallScoreAriaLabel}
                declaredCountText={labels.declaredCountText}
                retakeHref={retakeUrl}
                retakeLabel={labels.retakeButton}
                backHref={resultsUrl}
                backLabel={labels.backButton}
                canDownloadPdf={canDownloadPdf}
                isDownloadingPdf={isDownloadingPdf}
                pdfError={pdfError}
                downloadPdfLabel={labels.pdf.downloadButton}
                generatingPdfLabel={labels.pdf.generatingLabel}
                onDownloadPdf={handleDownloadPdf}
              />

              <AreaScoreSection
                groups={areaScoreGroups}
                isJointJourney={isJointJourney}
                recommendedScore={recommendedAreaScore}
                labels={labels.areas}
              />

              <CompetencyAnswerBox
                variant="declared"
                eyebrow={labels.competencies.eyebrow}
                title={labels.competencies.declaredTitle}
                groups={declaredCompetencies}
                labels={labels.competencies}
              />
              <CompetencyAnswerBox
                variant="undeclared"
                eyebrow={labels.competencies.eyebrow}
                title={labels.competencies.undeclaredTitle}
                groups={undeclaredCompetencies}
                labels={labels.competencies}
              />
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

export default JourneyResultView;
export { useJourneyResultVM } from "./journeyResult.viewmodel";
export * from "./journeyResult.types";
