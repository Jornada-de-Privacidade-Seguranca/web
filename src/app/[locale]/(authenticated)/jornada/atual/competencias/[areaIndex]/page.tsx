import CompetenciesQuestionnaireView from "@features/competencies-questionnaire";

export default async function CompetenciesQuestionnairePage({
  params,
}: {
  params: Promise<{ locale: string; areaIndex: string }>;
}) {
  const { areaIndex } = await params;
  return <CompetenciesQuestionnaireView areaIndexParam={areaIndex} />;
}
