import AdminUserDetailView from "@/features/admin-user-detail";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  return <AdminUserDetailView userId={id} />;
}
