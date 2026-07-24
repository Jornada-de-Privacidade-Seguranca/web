import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Wrappers do next-intl para os helpers de navegação do Next.js.
 * Use sempre estes no lugar dos nativos (Link, useRouter, redirect, usePathname)
 * para que o locale seja tratado automaticamente.
 *
 * @example
 * import { Link, useRouter, redirect } from '@shared/i18n/navigation'
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
