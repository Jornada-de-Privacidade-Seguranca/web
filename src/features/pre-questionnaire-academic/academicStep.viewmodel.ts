"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@shared/i18n/navigation";
import { useJourneyContext } from "@hooks/useJourneyContext";
import { ApiRequestError } from "@services/httpClient";
import {
  getCourseOptions,
  getSelectedCourses,
  saveSelectedCourses,
} from "@services/academicCoursesService";
import {
  getCurrentJourneyStepUrl,
  getNextPreQuestionnaireStep,
  getPreviousPreQuestionnaireStep,
} from "@shared/utils/journeyRoutes";
import type {
  AcademicStepLabels,
  AcademicStepViewModelReturn,
  CourseGroup,
  CourseItem,
  CourseOptionResponse,
} from "./academicStep.types";

const NEXT_STEP = getNextPreQuestionnaireStep("formacao-academica");
const PREVIOUS_STEP = getPreviousPreQuestionnaireStep("formacao-academica");

const JOURNEYS_HREF = "/jornadas";

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

function toCourseItem(course: CourseOptionResponse, isEnglish: boolean): CourseItem | null {
  if (!course.type) return null;
  return {
    id: String(course.id),
    label: (isEnglish ? course.name_en : course.name_pt) || course.name_pt,
    groupId: String(course.type.id),
  };
}

export function useAcademicStepVM(): AcademicStepViewModelReturn {
  const t = useTranslations("preQuestionnaire");
  const isEnglish = useLocale() === "en";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profileName, isNotFound: isJourneyContextNotFound } = useJourneyContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  // null enquanto o usuário não alterou a seleção: vale a seleção salva no backend
  const [userSelection, setUserSelection] = useState<Set<string> | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // As rotas de cursos operam sempre sobre a jornada em andamento ("current")
  const selectedQueryKey = ["pre-questionnaire", "current", "academic", "selected"];

  const optionsQuery = useQuery({
    queryKey: ["pre-questionnaire", "current", "academic", "options"],
    queryFn: getCourseOptions,
    retry: retryUnlessNotFound,
  });

  const selectedQuery = useQuery({
    queryKey: selectedQueryKey,
    queryFn: getSelectedCourses,
    retry: retryUnlessNotFound,
  });

  const mutation = useMutation({
    mutationFn: (ids: string[]) => saveSelectedCourses(ids.map(Number)),
    onSuccess: (savedCourses) => {
      queryClient.setQueryData(selectedQueryKey, savedCourses);
      // Navega para a próxima etapa: Certificações Profissionais
      if (NEXT_STEP) {
        router.push(getCurrentJourneyStepUrl(NEXT_STEP));
      }
    },
  });

  // Cursos disponíveis no idioma atual; cursos sem nível (type) não são exibidos
  const courses = useMemo(
    () =>
      (optionsQuery.data ?? [])
        .map((course) => toCourseItem(course, isEnglish))
        .filter((course): course is CourseItem => course !== null),
    [optionsQuery.data, isEnglish]
  );

  // Abas derivadas do nível dos cursos, ordenadas pelo id do nível
  const typeLegends = t.raw("academic.typeLegends") as Record<string, string>;
  const groups: CourseGroup[] = useMemo(() => {
    const types = new Map<number, CourseOptionResponse["type"]>();
    for (const course of optionsQuery.data ?? []) {
      if (course.type && !types.has(course.type.id)) types.set(course.type.id, course.type);
    }
    return [...types.values()]
      .filter((type): type is NonNullable<typeof type> => type !== null)
      .sort((a, b) => a.id - b.id)
      .map((type) => {
        const name = (isEnglish ? type.name_en : type.name_pt) || type.name_pt;
        const legend = typeLegends?.[String(type.id)];
        return { id: String(type.id), label: legend ? `${name} (${legend})` : name };
      });
  }, [optionsQuery.data, isEnglish, typeLegends]);

  const activeGroupId =
    selectedGroupId && groups.some((group) => group.id === selectedGroupId)
      ? selectedGroupId
      : groups[0]?.id;

  const savedIds = useMemo(
    () => new Set((selectedQuery.data ?? []).map((course) => String(course.id))),
    [selectedQuery.data]
  );
  const selection = userSelection ?? savedIds;

  const normalizedSearch = normalizeSearch(searchTerm);
  const visibleCourses = courses.filter(
    (course) =>
      course.groupId === activeGroupId &&
      (!normalizedSearch || normalizeSearch(course.label).includes(normalizedSearch))
  );

  // Chips: selecionados de todas as abas, na ordem da lista de cursos; cursos
  // salvos que não constem nas opções são exibidos com os dados da seleção salva
  const selectedCourses = useMemo(() => {
    const byId = new Map(courses.map((course) => [course.id, course]));
    for (const saved of selectedQuery.data ?? []) {
      const item = toCourseItem(saved, isEnglish);
      if (item && !byId.has(item.id)) byId.set(item.id, item);
    }
    return [...byId.values()].filter((course) => selection.has(course.id));
  }, [courses, selectedQuery.data, isEnglish, selection]);

  const updateSelection = (update: (next: Set<string>) => void) => {
    const next = new Set(selection);
    update(next);
    setUserSelection(next);
  };

  const handleToggleCourse = (id: string) => {
    updateSelection((next) => {
      if (next.has(id)) next.delete(id);
      else next.add(id);
    });
  };

  const handleRemoveCourse = (id: string) => {
    updateSelection((next) => next.delete(id));
  };

  // O PUT substitui a lista inteira: sem a seleção salva carregada,
  // continuar apagaria os cursos salvos anteriormente
  const isContinueDisabled = !selectedQuery.isSuccess;

  const handleContinue = () => {
    if (isContinueDisabled || mutation.isPending) return;
    mutation.mutate([...selection]);
  };

  const handleBack = () => {
    // Retorna para a etapa anterior: Tempo de Atuação no Perfil
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

  const labels: AcademicStepLabels = {
    stepTag: t("academic.stepTag"),
    title: t("academic.title"),
    description: t("academic.description"),
    searchPlaceholder: t("academic.searchPlaceholder"),
    searchAriaLabel: t("academic.searchAriaLabel"),
    groupsAriaLabel: t("academic.groupsAriaLabel"),
    emptyLabel: t("academic.emptyLabel"),
    counterLabel: t("academic.counterLabel", { count: selection.size }),
    removeCourseAriaLabel: (course: string) => t("academic.removeCourseAriaLabel", { course }),
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
    visibleCourses,
    selectedCourses,
    searchTerm,
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
    handleToggleCourse,
    handleRemoveCourse,
    handleContinue,
    handleBack,
    handleExit,
    handleCancelExit,
    handleConfirmExit,
    handleRetry,
  };
}
