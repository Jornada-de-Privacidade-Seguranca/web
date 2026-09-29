import RoleTenureStepView from "@features/pre-questionnaire-role-tenure";

interface JornadaRoleTenurePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function JornadaRoleTenurePage({
  params,
}: JornadaRoleTenurePageProps) {
  const { id } = await params;
  return <RoleTenureStepView journeySlug={id} />;
}
