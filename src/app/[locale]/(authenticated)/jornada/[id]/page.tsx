import JourneySummaryView from "@/features/journey-summary";

export default async function JornadaSummaryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  return <JourneySummaryView journeyId={id} />;
}
