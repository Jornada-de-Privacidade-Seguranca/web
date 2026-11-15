import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/shared/i18n/routing";
import { resolveLegacyRouteRedirect } from "@/shared/utils/legacyRouteRedirect";

const handleI18nRouting = createMiddleware(routing);

/**
 * middleware.ts (Next.js 15) / proxy.ts (Next.js 16+)
 * Redireciona permanentemente rotas legadas preservando idioma e query string,
 * e encaminha as demais requisições ao roteamento de i18n do next-intl.
 */
export default function proxy(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const legacyTarget = resolveLegacyRouteRedirect(
    request.nextUrl.pathname,
    request.nextUrl.search,
    cookieLocale
  );

  if (legacyTarget) {
    return NextResponse.redirect(new URL(legacyTarget, request.url), 308);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    // Inclui todas as rotas exceto arquivos estáticos e internos do Next.js
    "/((?!_next|api|.*\\..*).*)",
  ],
};
