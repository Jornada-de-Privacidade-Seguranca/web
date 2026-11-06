import type { Metadata } from "next";
import "./globals.css";
import { inter, manrope } from "@/shared/fonts";
import { cn } from "@/shared/lib/utils";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/shared/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { AppProviders } from "@/shared/providers";
import { ThemeScript } from "@/shared/theme-script";
import { isValidTheme } from "@/shared/theme";
import { cookies } from "next/headers";

import { QueryProvider } from "@/shared/providers/queryProvider";

export const metadata: Metadata = {
  title: "Jornada de Privacidade/Segurança",
  description:
    "Jornada de Privacidade e Segurança é uma aplicação web para auxiliar o usuário a ver seus conhecimentos sobre privacidade e segurança digital. Responda perguntas, veja seu desempenho e aprenda com dicas e explicações.",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const rawTheme = cookieStore.get("theme")?.value;
  const theme = isValidTheme(rawTheme) ? rawTheme : "dark";

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const appMessages = await getMessages();

  return (
    <html
      lang={locale === "en" ? "en" : "pt-BR"}
      data-scroll-behavior="smooth"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        manrope.variable,
        "font-sans",
        theme,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background" suppressHydrationWarning>
        <AppProviders>
          <ThemeScript />
          <NextIntlClientProvider messages={appMessages}>
            <QueryProvider>{children}</QueryProvider>
          </NextIntlClientProvider>
        </AppProviders>
      </body>
    </html>
  );
}
