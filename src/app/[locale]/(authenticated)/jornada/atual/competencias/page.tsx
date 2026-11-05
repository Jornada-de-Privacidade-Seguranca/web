import { redirect } from "next/navigation";
import { getCompetenciesAreaUrl } from "@shared/utils/journeyRoutes";

interface CompetenciesPageProps {
  params: Promise<{ locale: string }>;
}

// As instruções do questionário passaram para o resumo da jornada: o endereço
// antigo leva direto à primeira área
export default async function CompetenciesPage({ params }: CompetenciesPageProps) {
  const { locale } = await params;
  redirect(`/${locale}${getCompetenciesAreaUrl(0)}`);
}
