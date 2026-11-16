import type { Metadata } from "next";
import { Suspense } from "react";
import { InitialPasswordView } from "@/features/initial-password";

// O link do convite leva o código na URL: a página não deve ser indexada
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InitialPasswordPage() {
  // A página lê o e-mail e o código do convite da query string com useSearchParams
  return (
    <Suspense>
      <InitialPasswordView />
    </Suspense>
  );
}
