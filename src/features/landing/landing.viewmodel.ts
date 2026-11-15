"use client";

import {
  ArrowRight01Icon,
  CheckListIcon,
  DashboardSquare01Icon,
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
        icon: ArrowRight01Icon,
        title: t("steps.oneTitle"),
        description: t("steps.oneDescription"),
      },
      {
        number: "02",
        icon: CheckListIcon,
        title: t("steps.twoTitle"),
        description: t("steps.twoDescription"),
      },
      {
        number: "03",
        icon: DashboardSquare01Icon,
        title: t("steps.threeTitle"),
        description: t("steps.threeDescription"),
      },
    ],
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