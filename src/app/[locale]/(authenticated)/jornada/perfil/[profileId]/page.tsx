import JourneySummaryView from "@features/journey-summary";

export default async function ProfileSummaryPage({
  params,
}: {
  params: Promise<{ locale: string; profileId: string }>;
}) {
  const { profileId } = await params;
  return <JourneySummaryView profileId={profileId} />;
}
