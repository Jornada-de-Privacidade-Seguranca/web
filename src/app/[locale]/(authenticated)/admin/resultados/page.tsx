import { Suspense } from "react";
import AdminResultsView from "@/features/admin-results";

export default function AdminResultadosPage() {
  // O painel de resultados lê os filtros da URL via useSearchParams
  return (
    <Suspense>
      <AdminResultsView />
    </Suspense>
  );
}

