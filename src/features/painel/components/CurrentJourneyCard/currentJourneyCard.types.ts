import type { PendingAssessment } from "../../painel.types";

export interface CurrentJourneyCardProps {
  journey: PendingAssessment | null;
  sectionTitle: string;
  emptyMessage: string;
  exploreCtaText: string;
  /** Texto do botão da jornada ainda não iniciada */
  startCtaText: string;
  /** Texto do botão da jornada já iniciada */
  continueCtaText: string;
  /** "{n} perguntas" e "{n} min"; null oculta a informação */
  questionsText: string | null;
  timeText: string | null;
  badgeLabel: string;
  badgeVariant: "pending" | "in_progress";
}

export interface CurrentJourneyCardViewModelReturn {
  journey: PendingAssessment | null;
  sectionTitle: string;
  emptyMessage: string;
  exploreCtaText: string;
  actionText: string;
  actionHref: string;
  questionsText: string | null;
  timeText: string | null;
  badgeLabel: string;
  badgeVariant: "pending" | "in_progress";
}
