/** searchParams de uma página do App Router (valores repetidos chegam como lista). */
export type PageSearchParams = Record<string, string | string[] | undefined>;

/** Remonta a query string a partir dos searchParams de uma página, mantendo chaves repetidas. */
export function pageSearchParamsToQueryString(searchParams: PageSearchParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) query.append(key, item);
    }
  }
  return query.toString();
}
