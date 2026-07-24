import createMiddleware from 'next-intl/middleware'
import { routing } from '@/shared/i18n/routing'

/**
 * middleware.ts (Next.js 15) / proxy.ts (Next.js 16+)
 * Intercepta todas as requisições e redireciona para a rota com locale.
 *
 * Exemplos:
 *   /jornada        → /pt/jornada  (locale padrão)
 *   /en/jornada     → /en/jornada  (locale explícito)
 */
export default createMiddleware(routing)

export const config = {
  matcher: [
    // Inclui todas as rotas exceto arquivos estáticos e internos do Next.js
    '/((?!_next|api|.*\\..*).*)',
  ],
}
