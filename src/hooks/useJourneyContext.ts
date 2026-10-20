"use client";

import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  getJourney,
  mapKnowledgeDomain,
  JourneyRequestError,
  type JourneyDomain,
} from "@services/journeyService";

export interface UseJourneyContextReturn {
  /** Nome do perfil da jornada, conforme o idioma atual */
  profileName: string | null;
  /** Domínio da jornada, derivado de journey_profile.knowledge_domain.id */
  domain: JourneyDomain | null;
  /** Se a jornada ainda está em andamento (respostas salvas podem ser reaproveitadas) */
  isOngoing: boolean;
  isLoading: boolean;
  /** Falha ao buscar a jornada (inclui o caso de jornada não encontrada) */
  isError: boolean;
  /** A jornada não existe ou não pertence ao usuário */
  isNotFound: boolean;
  refetch: () => void;
}

/**
 * Busca o nome do perfil e o domínio da jornada atual (GET /journeys/{journey}).
 * Compartilhado pelas etapas do pré-questionário que dependem desses dados.
 */
export function useJourneyContext(journeyId: string): UseJourneyContextReturn {
  const locale = useLocale();

  const query = useQuery({
    queryKey: ["journey", "detail", journeyId],
    queryFn: () => getJourney(journeyId),
    enabled: Boolean(journeyId),
    // Jornada inexistente não se resolve com nova tentativa
    retry: (failureCount, error) =>
      !(error instanceof JourneyRequestError && error.type === "not_found") &&
      failureCount < 1,
  });

  const profile = query.data?.journey_profile ?? null;
  const profileName = profile
    ? (locale === "en" ? profile.name_en : profile.name_pt) || null
    : null;

  const isNotFound =
    query.error instanceof JourneyRequestError &&
    query.error.type === "not_found";

  return {
    profileName,
    domain: mapKnowledgeDomain(profile?.knowledge_domain),
    isOngoing: query.data?.status === "ongoing",
    isLoading: query.isLoading,
    isError: query.isError,
    isNotFound,
    refetch: () => {
      void query.refetch();
    },
  };
}
