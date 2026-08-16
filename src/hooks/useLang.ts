'use client'

import { useRouter, usePathname } from '@/shared/i18n/navigation'
import { useParams } from 'next/navigation'
import type { Locale } from '@/shared/i18n/routing'
import { routing } from '@/shared/i18n/routing'

export function useLang() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const currentLocale = (params?.locale as Locale) ?? routing.defaultLocale

  function changeLocale(locale: Locale) {
    router.replace(pathname, { locale })
  }

  return {
    locale: currentLocale,
    locales: routing.locales,
    changeLocale,
    isPt: currentLocale === 'pt',
    isEn: currentLocale === 'en',
  }
}
