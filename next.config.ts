import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const LEGACY_REDIRECT_PAIRS = [
  ["/assessments", "/jornadas"],
  ["/avaliacoes", "/jornadas"],
  ["/results", "/resultados"],
] as const;

export const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_REDIRECT_PAIRS.flatMap(([source, destination]) => [
      {
        source: `/:locale(pt|en)${source}`,
        destination: `/:locale${destination}`,
        permanent: true,
      },
      {
        source,
        destination,
        permanent: true,
      },
    ]);
  },
};

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");
export default withNextIntl(nextConfig);
