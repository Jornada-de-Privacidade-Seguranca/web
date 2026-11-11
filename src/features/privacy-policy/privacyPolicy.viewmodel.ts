"use client";

import {
  CheckListIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  SecurityCheckIcon,
  Shield01Icon,
  ShieldCheck,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { useAuth } from "@hooks/useAuth";
import type {
  PrivacyPolicySection,
  PrivacyPolicyViewModelReturn,
} from "./privacyPolicy.types";

export function usePrivacyPolicyVM(): PrivacyPolicyViewModelReturn {
  const t = useTranslations("privacyPolicy");
  const tLanding = useTranslations("landing");
  const { isAuthenticated } = useAuth();

  const sections: PrivacyPolicySection[] = [
    {
      id: "controlador-e-finalidade",
      number: "01",
      icon: Shield01Icon,
      title: t("sections.controller.title"),
      paragraphs: [t("sections.controller.p1"), t("sections.controller.p2")],
    },
    {
      id: "dados-coletados",
      number: "02",
      icon: UserIcon,
      title: t("sections.dataCollected.title"),
      paragraphs: [t("sections.dataCollected.p1")],
      bullets: [
        t("sections.dataCollected.b1"),
        t("sections.dataCollected.b2"),
        t("sections.dataCollected.b3"),
      ],
    },
    {
      id: "uso-dos-dados",
      number: "03",
      icon: CheckListIcon,
      title: t("sections.dataUsage.title"),
      paragraphs: [t("sections.dataUsage.p1")],
      bullets: [
        t("sections.dataUsage.b1"),
        t("sections.dataUsage.b2"),
        t("sections.dataUsage.b3"),
        t("sections.dataUsage.b4"),
      ],
    },
    {
      id: "compartilhamento-e-retencao",
      number: "04",
      icon: Clock01Icon,
      title: t("sections.sharingAndRetention.title"),
      paragraphs: [
        t("sections.sharingAndRetention.p1"),
        t("sections.sharingAndRetention.p2"),
      ],
    },
    {
      id: "seguranca-da-informacao",
      number: "05",
      icon: SecurityCheckIcon,
      title: t("sections.security.title"),
      paragraphs: [t("sections.security.p1")],
      bullets: [
        t("sections.security.b1"),
        t("sections.security.b2"),
        t("sections.security.b3"),
        t("sections.security.b4"),
      ],
    },
    {
      id: "direitos-do-titular",
      number: "06",
      icon: CheckmarkCircle02Icon,
      title: t("sections.userRights.title"),
      paragraphs: [t("sections.userRights.p1")],
      bullets: [
        t("sections.userRights.b1"),
        t("sections.userRights.b2"),
        t("sections.userRights.b3"),
        t("sections.userRights.b4"),
      ],
    },
    {
      id: "atualizacoes-e-contato",
      number: "07",
      icon: ShieldCheck,
      title: t("sections.updatesAndContact.title"),
      paragraphs: [
        t("sections.updatesAndContact.p1"),
        t("sections.updatesAndContact.p2"),
      ],
    },
  ];

  return {
    labels: {
      brand: tLanding("brand"),
      eyebrow: t("eyebrow"),
      title: t("title"),
      subtitle: t("subtitle"),
      lastUpdatedLabel: t("lastUpdatedLabel"),
      lastUpdatedDate: t("lastUpdatedDate"),
      tocTitle: t("tocTitle"),
      backLinkLabel: isAuthenticated ? t("backToDashboard") : t("backToHome"),
      primaryCtaLabel: isAuthenticated ? t("goToDashboard") : tLanding("header.login"),
      footerLeft: tLanding("footer.left"),
      footerRight: tLanding("footer.right"),
    },
    sections,
    backHref: isAuthenticated ? "/painel" : "/",
    primaryCtaHref: isAuthenticated ? "/painel" : "/login",
  };
}

