import ExperienceStepView from "@features/pre-questionnaire-experience";

interface ExperienceStepPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ExperienceStepPage({
  params,
}: ExperienceStepPageProps) {
  const { slug } = await params;
  return <ExperienceStepView journeyId={slug} />;
}
