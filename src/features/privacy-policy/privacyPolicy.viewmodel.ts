"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@shared/i18n/navigation";
import type {
  PrivacyPolicyLabels,
  PrivacyPolicyViewModelReturn,
} from "./privacyPolicy.types";

export function usePrivacyPolicyVM(): PrivacyPolicyViewModelReturn {
  const t = useTranslations("privacyPolicy");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = useCallback(() => {
    const from = searchParams.get("from");
    if (from && from.startsWith("/")) {
      router.push(from);
      return;
    }

    if (
      typeof window !== "undefined" &&
      document.referrer &&
      document.referrer.startsWith(window.location.origin)
    ) {
      router.back();
      return;
    }

    router.push("/login");
  }, [router, searchParams]);

  const fromParam = searchParams.get("from");
  const backHref = fromParam && fromParam.startsWith("/") ? fromParam : "/login";

  const labels: PrivacyPolicyLabels = {
    brand: t("brand"),
    title: t("title"),
    subtitle: t("subtitle"),
    cardTitle: t("cardTitle"),
    notice: t("notice"),
    backButton: t("back"),
  };

  return {
    labels,
    sections: [],
    handleBack,
    backHref,
  };
}
