import ExperienceStepView from "@features/pre-questionnaire-experience";

interface JornadaExperiencePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function JornadaExperiencePage({
  params,
}: JornadaExperiencePageProps) {
  const { id } = await params;
  return <ExperienceStepView journeyId={id} />;
}
