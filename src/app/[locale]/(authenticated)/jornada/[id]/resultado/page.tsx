import JourneyResultView from "@features/journey-result";

export default async function JornadaResultadoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  return <JourneyResultView journeyId={id} />;
}
