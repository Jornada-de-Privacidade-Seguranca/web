import type { Metadata } from "next";
import "./globals.css";
import { inter, manrope } from "@/shared/fonts";
import { cn } from "@/lib/utils";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/shared/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";

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
      )}
    >
      <body className="min-h-full flex flex-col bg-background">
        <NextIntlClientProvider messages={appMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
