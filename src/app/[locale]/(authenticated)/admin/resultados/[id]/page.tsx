import JourneyResultView from "@features/journey-result";
import {
  pageSearchParamsToQueryString,
  type PageSearchParams,
} from "@shared/utils/queryString";

export default async function AdminResultadoUsuarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  // A query string é a da listagem de onde o admin saiu, devolvida no "Voltar"
  return (
    <JourneyResultView
      journeyId={id}
      variant="admin"
      listQuery={pageSearchParamsToQueryString(query)}
    />
  );
}
