import type { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export interface LandingStep {
  number: string;
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
    };
  };
  steps: LandingStep[];
  isReady: boolean;
  handleScrollToHowItWorks: (e?: React.MouseEvent<HTMLElement>) => void;
  handleScrollToTop: (e?: React.MouseEvent<HTMLElement>) => void;
}

