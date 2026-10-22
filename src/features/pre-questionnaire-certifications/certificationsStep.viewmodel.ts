"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@shared/i18n/navigation";
import { useJourneyContext } from "@hooks/useJourneyContext";
import { ApiRequestError } from "@services/httpClient";
import {
  getCertificationOptions,
  getSelectedCertifications,
  saveSelectedCertifications,
} from "@services/certificationsService";
import {
  getCurrentJourneyStepUrl,
  getNextPreQuestionnaireStep,
  getPreviousPreQuestionnaireStep,
} from "@shared/utils/journeyRoutes";
import type {
  CertificationGroup,
  CertificationItem,
  CertificationOptionResponse,
  CertificationsStepLabels,
  CertificationsStepViewModelReturn,
} from "./certificationsStep.types";

const NEXT_STEP = getNextPreQuestionnaireStep("certificacoes-profissionais");
const PREVIOUS_STEP = getPreviousPreQuestionnaireStep("certificacoes-profissionais");

const JOURNEYS_HREF = "/jornadas";

/** Limite de certificações por jornada, validado também pelo backend. */
export const MAX_CERTIFICATIONS = 100;

/** Aba das certificações sem domínio de conhecimento (sempre a última). */
const OTHER_GROUP_ID = "other";

function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 404;
}

// Jornada inexistente não se resolve com nova tentativa
function retryUnlessNotFound(failureCount: number, error: unknown): boolean {
  return !isNotFoundError(error) && failureCount < 1;
}

/** Normaliza para busca: sem acentos, em minúsculas e sem espaços nas pontas. */
function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function toCertificationItem(certification: CertificationOptionResponse): CertificationItem {
  return {
    id: String(certification.id),
    label: certification.name,
    groupId: certification.knowledge_domain
      ? String(certification.knowledge_domain.id)
      : OTHER_GROUP_ID,
  };
}

export function useCertificationsStepVM(): CertificationsStepViewModelReturn {
  const t = useTranslations("preQuestionnaire");
  const locale = useLocale();
  const isEnglish = locale === "en";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profileName, isNotFound: isJourneyContextNotFound } = useJourneyContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  // null enquanto o usuário não alterou a seleção: vale a seleção salva no backend
  const [userSelection, setUserSelection] = useState<Set<string> | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // As rotas de certificações operam sempre sobre a jornada em andamento ("current")
  const selectedQueryKey = ["pre-questionnaire", "current", "certifications", "selected"];

  const optionsQuery = useQuery({
    queryKey: ["pre-questionnaire", "current", "certifications", "options"],
    queryFn: getCertificationOptions,
    retry: retryUnlessNotFound,
  });

  const selectedQuery = useQuery({
    queryKey: selectedQueryKey,
    queryFn: getSelectedCertifications,
    retry: retryUnlessNotFound,
  });

  const mutation = useMutation({
    mutationFn: (ids: string[]) => saveSelectedCertifications(ids.map(Number)),
    onSuccess: (savedCertifications) => {
      queryClient.setQueryData(selectedQueryKey, savedCertifications);
      // Navega para a próxima etapa: Competências
      if (NEXT_STEP) {
        router.push(getCurrentJourneyStepUrl(NEXT_STEP));
      }
    },
  });

  // Certificações ordenadas pelo nome, ignorando acentos e maiúsculas
  const certifications = useMemo(
    () =>
      (optionsQuery.data ?? [])
        .map(toCertificationItem)
        .sort((a, b) => a.label.localeCompare(b.label, locale, { sensitivity: "base" })),
    [optionsQuery.data, locale]
  );

  // Abas por domínio, ordenadas pelo id do domínio; sem domínio vai para "Outras"
  const otherGroupLabel = t("certifications.otherGroupLabel");
  const groups: CertificationGroup[] = useMemo(() => {
    const domains = new Map<number, NonNullable<CertificationOptionResponse["knowledge_domain"]>>();
    let hasOther = false;
    for (const certification of optionsQuery.data ?? []) {
      const domain = certification.knowledge_domain;
      if (!domain) hasOther = true;
      else if (!domains.has(domain.id)) domains.set(domain.id, domain);
    }
    const domainGroups = [...domains.values()]
      .sort((a, b) => a.id - b.id)
      .map((domain) => ({
        id: String(domain.id),
        label: (isEnglish ? domain.name_en : domain.name_pt) || domain.name_pt,
      }));
    return hasOther
      ? [...domainGroups, { id: OTHER_GROUP_ID, label: otherGroupLabel }]
      : domainGroups;
  }, [optionsQuery.data, isEnglish, otherGroupLabel]);

  const activeGroupId =
    selectedGroupId && groups.some((group) => group.id === selectedGroupId)
      ? selectedGroupId
      : groups[0]?.id;

  const savedIds = useMemo(
    () => new Set((selectedQuery.data ?? []).map((certification) => String(certification.id))),
    [selectedQuery.data]
  );
  const selection = userSelection ?? savedIds;
  const isLimitReached = selection.size >= MAX_CERTIFICATIONS;

  const normalizedSearch = normalizeSearch(searchTerm);
  const visibleCertifications = certifications.filter(
    (certification) =>
      certification.groupId === activeGroupId &&
      (!normalizedSearch || normalizeSearch(certification.label).includes(normalizedSearch))
  );

  // Chips: selecionadas de todas as abas, na ordem da lista; salvas que não
  // constem nas opções são exibidas com os dados da seleção salva
  const selectedCertifications = useMemo(() => {
    const byId = new Map(certifications.map((certification) => [certification.id, certification]));
    for (const saved of selectedQuery.data ?? []) {
      const item = toCertificationItem(saved);
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    return [...byId.values()].filter((certification) => selection.has(certification.id));
  }, [certifications, selectedQuery.data, selection]);

  const updateSelection = (update: (next: Set<string>) => void) => {
    const next = new Set(selection);
    update(next);
    setUserSelection(next);
  };

  const handleToggleCertification = (id: string) => {
    updateSelection((next) => {
      if (next.has(id)) next.delete(id);
      // Com o limite atingido, só é possível desmarcar
      else if (next.size < MAX_CERTIFICATIONS) next.add(id);
    });
  };

  const handleRemoveCertification = (id: string) => {
    updateSelection((next) => next.delete(id));
  };

  // O PUT substitui a lista inteira: sem a seleção salva carregada,
  // continuar apagaria as certificações salvas anteriormente
  const isContinueDisabled = !selectedQuery.isSuccess;

  const handleContinue = () => {
    if (isContinueDisabled || mutation.isPending) return;
    mutation.mutate([...selection]);
  };

  const handleBack = () => {
    // Retorna para a etapa anterior: Formação Acadêmica
    if (PREVIOUS_STEP) {
      router.push(getCurrentJourneyStepUrl(PREVIOUS_STEP));
    }
  };

  const handleExit = () => {
    setIsExitModalOpen(true);
  };

  const handleCancelExit = () => {
    setIsExitModalOpen(false);
  };

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    router.push(JOURNEYS_HREF);
  };

  // Reexecuta o que falhou: as buscas (opções e seleção salva) ou o salvamento
  const handleRetry = () => {
    if (optionsQuery.isError || selectedQuery.isError) {
      if (optionsQuery.isError) void optionsQuery.refetch();
      if (selectedQuery.isError) void selectedQuery.refetch();
      return;
    }
    if (mutation.isError) {
      mutation.mutate([...selection]);
    }
  };

  const isJourneyNotFound =
    isJourneyContextNotFound ||
    isNotFoundError(optionsQuery.error) ||
    isNotFoundError(selectedQuery.error) ||
    isNotFoundError(mutation.error);

  const saveError =
    mutation.error instanceof ApiRequestError && mutation.error.status === 422
      ? mutation.error.message
      : t("saveError");

  const error =
    optionsQuery.isError || selectedQuery.isError
      ? t("errorMessage")
      : mutation.isError
        ? saveError
        : null;

  const labels: CertificationsStepLabels = {
    stepTag: t("certifications.stepTag"),
    title: t("certifications.title"),
    description: t("certifications.description"),
    searchPlaceholder: t("certifications.searchPlaceholder"),
    searchAriaLabel: t("certifications.searchAriaLabel"),
    groupsAriaLabel: t("certifications.groupsAriaLabel"),
    emptyLabel: t("certifications.emptyLabel"),
    counterLabel: t("certifications.counterLabel", { count: selection.size }),
    limitReachedLabel: t("certifications.limitReachedLabel", { max: MAX_CERTIFICATIONS }),
    removeCertificationAriaLabel: (certification: string) =>
      t("certifications.removeCertificationAriaLabel", { certification }),
    backLabel: t("actions.back"),
    backAriaLabel: t("header.backAriaLabel"),
    continueLabel: t("actions.continue"),
    savingLabel: t("actions.saving"),
    exitLabel: t("header.exitButton"),
    exitAriaLabel: t("header.exitAriaLabel"),
    exitModal: {
      title: t("exitModal.title"),
      description: t("exitModal.description"),
      cancelButton: t("exitModal.cancelButton"),
      confirmButton: t("exitModal.confirmButton"),
    },
    loadingText: t("loading"),
    retryButton: t("retryButton"),
    noOngoingJourneyTitle: t("noOngoingJourneyTitle"),
    noOngoingJourneyMessage: t("noOngoingJourneyMessage"),
    backToJourneysLink: t("backToJourneysLink"),
  };

  return {
    journeyTitle: profileName ?? "",
    groups,
    activeGroupId,
    visibleCertifications,
    selectedCertifications,
    searchTerm,
    maxSelectable: MAX_CERTIFICATIONS,
    isLimitReached,
    isLoading: optionsQuery.isLoading || selectedQuery.isLoading,
    isSubmitting: mutation.isPending,
    isContinueDisabled,
    error,
    isJourneyNotFound,
    isExitModalOpen,
    labels,
    journeysHref: JOURNEYS_HREF,
    handleSearchChange: setSearchTerm,
    handleGroupChange: setSelectedGroupId,
    handleToggleCertification,
    handleRemoveCertification,
    handleContinue,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  };
}
