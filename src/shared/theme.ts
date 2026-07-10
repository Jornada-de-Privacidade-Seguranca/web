export const fonts = {
  /** Fonte de corpo — textos, labels, parágrafos */
  sans: 'Inter',
  /** Fonte de display — títulos, headings */
  display: 'Manrope',
} as const

export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
} as const

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const

export const lineHeights = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
} as const

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const

export const borderWidth = {
  default: '1px',
  2: '2px',
  4: '4px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  none: 'none',
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ---------------------------------------------------------------------------
// Tema Escuro
// Paleta slate/blue fria em oklch
// ---------------------------------------------------------------------------

export const darkTheme = {
  background: 'oklch(0.21 0.03 256)',         /* #0f172a slate */
  foreground: 'oklch(0.92 0.015 250)',         /* #e2e8f0 off-white */

  card: 'oklch(0.27 0.03 257)',               /* #1e293b */
  cardForeground: 'oklch(0.92 0.015 250)',

  popover: 'oklch(0.27 0.03 257)',
  popoverForeground: 'oklch(0.92 0.015 250)',

  surfaceElevated: 'oklch(0.31 0.028 258)',

  primary: 'oklch(0.72 0.13 255)',            /* #60a5fa blue-400 */
  primaryForeground: 'oklch(0.18 0.03 256)',

  secondary: 'oklch(0.31 0.028 258)',
  secondaryForeground: 'oklch(0.92 0.015 250)',

  muted: 'oklch(0.28 0.025 257)',
  mutedForeground: 'oklch(0.68 0.02 257)',    /* #94a3b8 slate-400 */

  accent: 'oklch(0.34 0.04 257)',
  accentForeground: 'oklch(0.92 0.015 250)',

  destructive: 'oklch(0.60 0.20 25)',         /* red */
  destructiveForeground: 'oklch(0.98 0.01 256)',

  success: 'oklch(0.65 0.15 145)',            /* green */
  successForeground: 'oklch(0.98 0.01 145)',

  warning: 'oklch(0.78 0.15 70)',             /* amber */
  warningForeground: 'oklch(0.20 0.03 70)',

  border: 'oklch(0.33 0.025 258)',
  input: 'oklch(0.33 0.025 258)',
  ring: 'oklch(0.72 0.13 255)',               /* foco — mesma cor da primary */
}

// ---------------------------------------------------------------------------
// Tema Claro
// ---------------------------------------------------------------------------

export const lightTheme = {
  background: 'oklch(0.96 0.005 240)',        /* cinza-azulado muito claro */
  foreground: 'oklch(0.18 0.025 250)',        /* quase preto frio */

  card: 'oklch(0.99 0.002 240)',              /* branco levemente frio */
  cardForeground: 'oklch(0.18 0.025 250)',

  popover: 'oklch(0.99 0.002 240)',
  popoverForeground: 'oklch(0.18 0.025 250)',

  surfaceElevated: 'oklch(1 0 0)',            /* branco puro para elevação */

  primary: 'oklch(0.48 0.17 240)',            /* blue-700 gov.br */
  primaryForeground: 'oklch(0.99 0.002 240)',

  secondary: 'oklch(0.90 0.015 240)',         /* azul bem claro */
  secondaryForeground: 'oklch(0.25 0.04 250)',

  muted: 'oklch(0.91 0.01 240)',
  mutedForeground: 'oklch(0.48 0.02 250)',    /* slate-500 */

  accent: 'oklch(0.87 0.03 240)',
  accentForeground: 'oklch(0.25 0.04 250)',

  destructive: 'oklch(0.53 0.22 25)',         /* red */
  destructiveForeground: 'oklch(0.99 0.002 240)',

  success: 'oklch(0.52 0.15 145)',            /* green */
  successForeground: 'oklch(0.99 0.002 145)',

  warning: 'oklch(0.65 0.16 70)',             /* amber */
  warningForeground: 'oklch(0.18 0.03 70)',

  border: 'oklch(0.84 0.012 240)',
  input: 'oklch(0.84 0.012 240)',
  ring: 'oklch(0.48 0.17 240)',               /* foco — mesma cor da primary */
}

// ---------------------------------------------------------------------------
// Utilitário: converte os tokens em variáveis CSS
// Use em generateThemeVars('dark') ou generateThemeVars('light')
// ---------------------------------------------------------------------------

type ThemeTokens = typeof darkTheme

function toKebab(str: string): string {
  return str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
}

export function generateThemeVars(theme: 'dark' | 'light'): Record<string, string> {
  const tokens: ThemeTokens = theme === 'dark' ? darkTheme : lightTheme

  return Object.entries(tokens).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[`--${toKebab(key)}`] = value
      return acc
    },
    {}
  )
}

// ---------------------------------------------------------------------------
// Tema completo exportado — consumido pelo tailwind.config.ts
// ---------------------------------------------------------------------------

/**
 * @deprecated Este arquivo está obsoleto e será removido eventualmente. Use o arquivo [`src/app/\[locale\]/globals.css`](../../src/app/[locale]/globals.css) para definir o tema da aplicação.
 * 
 */
export const theme = {
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  breakpoints,
  dark: darkTheme,
  light: lightTheme,
} as const

export type Theme = typeof theme
export type ThemeMode = 'dark' | 'light'
