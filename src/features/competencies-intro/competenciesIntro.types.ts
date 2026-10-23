import type React from "react";
import type { HugeiconsIcon } from "@hugeicons/react";

export type InstructionIcon = React.ComponentProps<
  typeof HugeiconsIcon
>["icon"];

export interface InstructionItem {
  id: "objective" | "sincerity" | "navigation" | "estimatedTime";
  icon: InstructionIcon;
  title: string;
  description: string;
  /** A descrição depende de dados ainda em carregamento (skeleton no lugar do texto) */
  isLoading: boolean;
}

export interface CompetenciesIntroLabels {
  stepTag: string;
  title: string;
  subtitle: string;
  /** Texto de apresentação, já com o domínio da jornada aplicado */
  intro: string;
  tip: string;
  instructionsAriaLabel: string;
  startLabel: string;
  backLabel: string;
  backAriaLabel: string;
  exitLabel: string;
  exitAriaLabel: string;
  exitModal: {
    title: string;
    description: string;
    cancelButton: string;
    confirmButton: string;
  };
  loadingText: string;
  noOngoingJourneyTitle: string;
  noOngoingJourneyMessage: string;
  backToJourneysLink: string;
}

export interface CompetenciesIntroViewModelReturn {
  journeyTitle: string;
  labels: CompetenciesIntroLabels;
  instructionItems: InstructionItem[];
  /** Carregamento do contexto da jornada (domínio) e da duração estimada */
  isLoading: boolean;
  isJourneyNotFound: boolean;
  isExitModalOpen: boolean;
  journeysHref: string;
  handleStart: () => void;
  handleBack: () => void;
  handleExit: () => void;
  handleCancelExit: () => void;
  handleConfirmExit: () => void;
}
