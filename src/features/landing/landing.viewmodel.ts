"use client";

import {
  ArrowRight01Icon,
  CheckListIcon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import type { LandingViewModelReturn } from "./landing.types";

export function useLandingVM(): LandingViewModelReturn {
  const t = useTranslations("landing");

  return {
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
  };
}