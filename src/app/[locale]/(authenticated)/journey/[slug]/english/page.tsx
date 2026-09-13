import EnglishStepView from "@features/pre-questionnaire-english";

interface EnglishStepPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function EnglishStepPage({ params }: EnglishStepPageProps) {
  const { slug } = await params;
  return <EnglishStepView journeySlug={slug} />;
}
