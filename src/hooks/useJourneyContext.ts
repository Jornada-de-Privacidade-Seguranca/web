"use client";

import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@hooks/useAuth";
import {
  getCurrentJourney,
  mapKnowledgeDomain,
  JourneyRequestError,
  type JourneyDomain,
} from "@services/journeyService";

export const CURRENT_JOURNEY_QUERY_KEY = ["journey", "current"] as const;

export interface UseJourneyContextReturn {
  /** Id da jornada em andamento (null enquanto carrega ou se não houver) */
  journeyId: string | null;
  /** Id do perfil da jornada em andamento */
  profileId: string | null;
  /** Nome do perfil da jornada, conforme o idioma atual */
  profileName: string | null;
  /** Domínio da jornada, derivado de journey_profile.knowledge_domain.id */
  domain: JourneyDomain | null;
  isLoading: boolean;
  /** Falha ao buscar a jornada (inclui o caso de não haver jornada em andamento) */
  isError: boolean;
  /** O usuário não tem jornada em andamento */
  isNotFound: boolean;
  refetch: () => void;
}

/**
 * Busca a jornada em andamento do usuário autenticado (no máximo uma por vez)
 * e expõe o nome do perfil e o domínio. As etapas do pré-questionário usam este
 * hook em vez de um id na URL, para que a tela e o backend tratem sempre da
 * mesma jornada.
 */
export function useJourneyContext(): UseJourneyContextReturn {
  const locale = useLocale();
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: [...CURRENT_JOURNEY_QUERY_KEY, userId],
    queryFn: () => getCurrentJourney(userId as number),
    enabled: Boolean(userId),
    // Ausência de jornada em andamento não se resolve com nova tentativa
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
    journeyId: query.data ? String(query.data.id) : null,
    profileId: profile?.id != null ? String(profile.id) : null,
    profileName,
    domain: mapKnowledgeDomain(profile?.knowledge_domain),
    // Enquanto a sessão carrega a query fica desabilitada; continua "carregando"
    isLoading: query.isLoading || (!userId && isAuthLoading),
    isError: query.isError,
    isNotFound,
    refetch: () => {
      void query.refetch();
    },
  };
}
