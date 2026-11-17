import { Suspense } from "react";
import AdminUsersView from "@/features/admin-users";

export default function AdminUsuariosPage() {
  // A listagem lê a busca, os filtros e a página da URL com useSearchParams
  return (
    <Suspense>
      <AdminUsersView />
    </Suspense>
  );
}
