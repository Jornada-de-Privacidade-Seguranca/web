import type { ReactNode } from "react";

export type CollapsibleSectionHeadingLevel = 2 | 3 | 4;

export interface CollapsibleSectionProps {
  title: string;
  /** Rótulo em caixa alta acima do título (ex.: "Perfil profissional") */
  eyebrow?: string;
  /** Nível do heading, conforme a hierarquia da página */
  headingLevel?: CollapsibleSectionHeadingLevel;
  defaultOpen?: boolean;
  /** "card" para as seções da página; "nested" para grupos dentro de uma seção */
  variant?: "card" | "nested";
  testId?: string;
  children: ReactNode;
}

export interface CollapsibleSectionViewModelReturn {
  isOpen: boolean;
  buttonId: string;
  contentId: string;
  handleToggle: () => void;
}
