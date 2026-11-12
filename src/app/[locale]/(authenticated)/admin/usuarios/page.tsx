import { Suspense } from "react";
import AdminUsersView from "@/features/admin-users";

export default function AdminUsuariosPage() {
  return (
    <Suspense>
      <AdminUsersView />
    </Suspense>
  );
}
