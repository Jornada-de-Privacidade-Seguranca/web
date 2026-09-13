import RoleTenureStepView from "@features/pre-questionnaire-role-tenure";

interface RoleTenureStepPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function RoleTenureStepPage({
  params,
}: RoleTenureStepPageProps) {
  const { slug } = await params;
  return <RoleTenureStepView journeySlug={slug} />;
}
