import { Suspense } from "react";
import { AuthView } from "@/features/auth";

export default function LoginPage() {
  // O login lê a query string (motivo e página de retorno) com useSearchParams
  return (
    <Suspense>
      <AuthView />
    </Suspense>
  );
}
