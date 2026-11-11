import type { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export interface LandingStep {
  number: string;
  icon: typeof ArrowRight01Icon;
  title: string;
  description: string;
  /** Exibe seta para a direita entre cards da mesma linha no desktop (3 colunas). */
  showRightArrowOnDesktop: boolean;
  /** Exibe seta para baixo abaixo deste card também no desktop (passagem de linha ou para o bloco Extra). */
  showDownArrowOnDesktop: boolean;
}

export interface LandingExtraBlock {
  badge: string;
  icon: typeof ArrowRight01Icon;
  title: string;
  description: string;
}

export interface LandingViewModelReturn {
  labels: {
    brand: string;
    header: {
      howItWorks: string;
      login: string;
    };
    hero: {
      eyebrow: string;
      title: string;
      description: string;
      primaryAction: string;
      secondaryAction: string;
    };
    steps: {
      title: string;
      description: string;
    };
    footer: {
      left: string;
      right: string;
      privacyLink: string;
    };
  };
  steps: LandingStep[];
  extra: LandingExtraBlock;
  isReady: boolean;
  handleScrollToHowItWorks: (e?: React.MouseEvent<HTMLElement>) => void;
  handleScrollToTop: (e?: React.MouseEvent<HTMLElement>) => void;
}
