import type { JourneyInstructionItem } from "@features/journey-summary/journeySummary.types";

export interface JourneyInstructionsSectionProps {
  title: string;
  /** Texto de apresentação, já com o domínio da jornada aplicado */
  intro: string;
  items: JourneyInstructionItem[];
  itemsAriaLabel: string;
  tip: string;
}

export type JourneyInstructionsSectionViewModelReturn = JourneyInstructionsSectionProps;
