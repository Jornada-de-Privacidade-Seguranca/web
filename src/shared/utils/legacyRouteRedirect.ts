import { routing, type Locale } from "../i18n/routing";

export const LEGACY_ROUTE_REDIRECTS: Record<string, string> = {
  "/assessments": "/jornadas",
  "/avaliacoes": "/jornadas",
  "/results": "/resultados",
};

function isSupportedLocale(value: string | undefined): value is Locale {
  return Boolean(value && routing.locales.includes(value as Locale));
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "");
  }
  return pathname;
}

/**
 * Resolve o destino permanente de rotas legadas (`/assessments`, `/avaliacoes`, `/results`),
 * preservando o idioma (prefixo de rota, cookie ou idioma padrão) e os parâmetros de busca.
 */
export function resolveLegacyRouteRedirect(
  pathname: string,
  search = "",
  preferredLocale?: string
): string | null {
  const normalized = normalizePath(pathname);

  if (normalized in LEGACY_ROUTE_REDIRECTS) {
    const targetLocale = isSupportedLocale(preferredLocale)
      ? preferredLocale
      : routing.defaultLocale;
    return `/${targetLocale}${LEGACY_ROUTE_REDIRECTS[normalized]}${search}`;
  }

  const localePattern = new RegExp(`^/(${routing.locales.join("|")})(/.*)$`);
  const match = localePattern.exec(normalized);
  if (!match) return null;

  const [, locale, subPath] = match;
  const destination = LEGACY_ROUTE_REDIRECTS[subPath];
  if (!destination) return null;

  return `/${locale}${destination}${search}`;
}

