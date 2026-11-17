import { normalizeScore } from "@shared/utils/scoreBand";
import type {
  AdminDomainAverage,
  AdminResultDomainOption,
  AdminResultItem,
  AdminResultsFilters,
  JourneyDomain,
  ScoreBand,
} from "./adminResults.types";

const VALID_DOMAINS = new Set<JourneyDomain>(["privacy", "security", "joint"]);

export const EMPTY_ADMIN_RESULTS_FILTERS: AdminResultsFilters = {
  search: "",
  userId: "",
  department: "",
  domains: [],
  journeyProfileId: "",
  dateFrom: "",
  dateTo: "",
};

function isValidJourneyDomain(value: string): value is JourneyDomain {
  return VALID_DOMAINS.has(value as JourneyDomain);
}

/**
 * Extrai filtros e número da página a partir de `URLSearchParams`.
 * Suporta `domains` separados por vírgula (`domains=privacy,security`) ou repetidos.
 */
export function parseAdminResultsSearchParams(
  searchParams: Pick<URLSearchParams, "get" | "getAll">
): { filters: AdminResultsFilters; page: number } {
  const rawDomains = searchParams
    .getAll("domains")
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(isValidJourneyDomain);

  const uniqueDomains = Array.from(new Set(rawDomains));

  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  return {
    filters: {
      search: searchParams.get("search") ?? "",
      userId: searchParams.get("userId") ?? "",
      department: searchParams.get("department") ?? "",
      domains: uniqueDomains,
      journeyProfileId: searchParams.get("journeyProfileId") ?? "",
      dateFrom: searchParams.get("dateFrom") ?? "",
      dateTo: searchParams.get("dateTo") ?? "",
    },
    page,
  };
}

/**
 * Serializa filtros ativos e página em query string limpa (omite valores vazios e página 1).
 */
export function serializeAdminResultsSearchParams(
  filters: AdminResultsFilters,
  page: number
): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.department) params.set("department", filters.department);
  if (filters.domains.length > 0) params.set("domains", filters.domains.join(","));
  if (filters.journeyProfileId) params.set("journeyProfileId", filters.journeyProfileId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (page > 1) params.set("page", String(page));

  return params.toString();
}

export function hasActiveAdminResultsFilters(filters: AdminResultsFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.userId !== "" ||
    filters.department !== "" ||
    filters.domains.length > 0 ||
    filters.journeyProfileId !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}

const SCORE_BADGE_CLASSES: Record<ScoreBand, string> = {
  strong:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25",
  medium:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/25",
  weak:
    "bg-destructive/15 text-destructive ring-1 ring-destructive/25",
};

/** Retorna classes de cor do badge de nota conforme a faixa (strong, medium, weak). */
export function getScoreBadgeClasses(band: ScoreBand): string {
  return SCORE_BADGE_CLASSES[band];
}

/**
 * Calcula a média por domínio a partir dos resultados filtrados para cada domínio
 * conhecido nos dados. Domínios sem jornada concluída retornam `averageScore: null`.
 */
export function computeDomainAverages(
  items: AdminResultItem[],
  domainsCatalog: AdminResultDomainOption[]
): AdminDomainAverage[] {
  const totalsByDomain = new Map<JourneyDomain, { sum: number; count: number }>();

  for (const item of items) {
    const current = totalsByDomain.get(item.domain) ?? { sum: 0, count: 0 };
    totalsByDomain.set(item.domain, {
      sum: current.sum + item.score,
      count: current.count + 1,
    });
  }

  return domainsCatalog.map((domainMeta) => {
    const stats = totalsByDomain.get(domainMeta.id);
    const completedCount = stats?.count ?? 0;
    return {
      domain: domainMeta.id,
      namePt: domainMeta.namePt,
      nameEn: domainMeta.nameEn,
      label: domainMeta.label,
      averageScore: completedCount > 0 && stats ? normalizeScore(stats.sum / completedCount) : null,
      completedCount,
    };
  });
}

/** Formata data ISO em UTC para exibição tabular curta conforme idioma (PT/EN). */
export function formatAdminResultDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

