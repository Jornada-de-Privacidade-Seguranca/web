import type { ScoreValue } from "@features/journey-result/journeyResult.types";

export interface ScoreSummaryCardProps {
  journeyTitle: string;
  score: ScoreValue;
  overallLabel: string;
  scoreAriaLabel: string;
  declaredCountText: string;
  /** Sem link, o botão de refazer não aparece */
  retakeHref: string | null;
  retakeLabel: string;
  backHref: string;
  backLabel: string;
  /** Exibe o botão de PDF (só em jornadas concluídas) */
  canDownloadPdf: boolean;
  isDownloadingPdf: boolean;
  /** Mensagem da falha no download, anunciada a leitores de tela */
  pdfError: string | null;
  downloadPdfLabel: string;
  generatingPdfLabel: string;
  onDownloadPdf: () => void;
}

export type ScoreSummaryCardViewModelReturn = ScoreSummaryCardProps;
