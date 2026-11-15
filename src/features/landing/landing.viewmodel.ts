"use client";

import {
  Analytics01Icon,
  CheckListIcon,
  Login01Icon,
  RefreshIcon,
  Target02Icon,
  TradeUpIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { useRequireGuest } from "@/hooks/useAuthGuard";
import type { LandingViewModelReturn } from "./landing.types";

export function useLandingVM(): LandingViewModelReturn {
  const t = useTranslations("landing");
  const { isLoading, isAuthenticated } = useRequireGuest();

  return {
    isReady: !isLoading && !isAuthenticated,
    labels: {
      brand: t("brand"),
      header: {
        howItWorks: t("header.howItWorks"),
        login: t("header.login"),
      },
      hero: {
        eyebrow: t("hero.eyebrow"),
        title: t("hero.title"),
        description: t("hero.description"),
        primaryAction: t("hero.primaryAction"),
        secondaryAction: t("hero.secondaryAction"),
      },
      steps: {
        title: t("steps.title"),
        description: t("steps.description"),
      },
      footer: {
        left: `© ${new Date().getFullYear()} ${t("footer.left")}`,
        right: t("footer.right"),
        privacyLink: t("footer.privacyLink"),
      },
    },
    steps: [
      {
        number: "01",
        icon: Login01Icon,
        title: t("steps.oneTitle"),
        description: t("steps.oneDescription"),
        showRightArrowOnDesktop: true,
        showDownArrowOnDesktop: false,
      },
      {
        number: "02",
        icon: UserIcon,
        title: t("steps.twoTitle"),
        description: t("steps.twoDescription"),
        showRightArrowOnDesktop: true,
        showDownArrowOnDesktop: false,
      },
      {
        number: "03",
        icon: CheckListIcon,
        title: t("steps.threeTitle"),
        description: t("steps.threeDescription"),
        showRightArrowOnDesktop: false,
        showDownArrowOnDesktop: true,
      },
      {
        number: "04",
        icon: Analytics01Icon,
        title: t("steps.fourTitle"),
        description: t("steps.fourDescription"),
        showRightArrowOnDesktop: true,
        showDownArrowOnDesktop: false,
      },
      {
        number: "05",
        icon: TradeUpIcon,
        title: t("steps.fiveTitle"),
        description: t("steps.fiveDescription"),
        showRightArrowOnDesktop: true,
        showDownArrowOnDesktop: false,
      },
      {
        number: "06",
        icon: RefreshIcon,
        title: t("steps.sixTitle"),
        description: t("steps.sixDescription"),
        showRightArrowOnDesktop: false,
        showDownArrowOnDesktop: true,
      },
    ],
    extra: {
      badge: t("extra.badge"),
      icon: Target02Icon,
      title: t("extra.title"),
      description: t("extra.description"),
    },
    handleScrollToHowItWorks: (e?: React.MouseEvent<HTMLElement>) => {
      if (e) e.preventDefault();
      const element = document.getElementById("como-funciona");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    },
    handleScrollToTop: (e?: React.MouseEvent<HTMLElement>) => {
      if (e) e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };
}
