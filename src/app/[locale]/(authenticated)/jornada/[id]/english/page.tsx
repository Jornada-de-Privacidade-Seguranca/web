import EnglishStepView from "@features/pre-questionnaire-english";

interface JornadaEnglishPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function JornadaEnglishPage({
  params,
}: JornadaEnglishPageProps) {
  const { id } = await params;
  return <EnglishStepView journeySlug={id} />;
}
