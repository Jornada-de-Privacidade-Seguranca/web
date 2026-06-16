import type { Metadata } from "next";
import "./globals.css";
import { inter, manrope } from "@/shared/fonts";

export const metadata: Metadata = {
  title: "Jornada de Privacidade/Segurança",
  description:
    "Preencha este formulário para avaliar suas práticas de privacidade e segurança online. Receba um feedback sobre o seu conhecimento com base na suas respostas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
