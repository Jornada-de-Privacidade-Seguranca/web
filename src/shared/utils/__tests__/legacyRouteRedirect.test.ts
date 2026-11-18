import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-intl/middleware", () => ({
  default: () => vi.fn(),
}));

import proxy from "@/proxy";
import { nextConfig } from "../../../../next.config";
import { resolveLegacyRouteRedirect } from "../legacyRouteRedirect";

describe("legacyRouteRedirect & proxy", () => {
  describe("resolveLegacyRouteRedirect", () => {
    it.each([
      ["/pt/assessments", "?status=pending", "/pt/jornadas?status=pending"],
      ["/en/assessments", "?page=2", "/en/jornadas?page=2"],
      ["/pt/avaliacoes", "", "/pt/jornadas"],
      ["/en/avaliacoes/", "?search=lgpd", "/en/jornadas?search=lgpd"],
      ["/pt/results", "?page=2", "/pt/resultados?page=2"],
      ["/en/results", "?page=2&domains=1", "/en/resultados?page=2&domains=1"],
      ["/pt/cadastro", "?from=landing", "/pt/signup?from=landing"],
      ["/en/cadastro/", "", "/en/signup"],
    ])(
      "deve redirecionar %s (%s) preservando idioma e query string para %s",
      (pathname, search, expected) => {
        expect(resolveLegacyRouteRedirect(pathname, search)).toBe(expected);
      }
    );

    it("deve usar o idioma preferido ou padrão quando a rota antiga vier sem prefixo de locale", () => {
      expect(resolveLegacyRouteRedirect("/results", "?page=2")).toBe("/pt/resultados?page=2");
      expect(resolveLegacyRouteRedirect("/results", "?page=2", "en")).toBe(
        "/en/resultados?page=2"
      );
      expect(resolveLegacyRouteRedirect("/assessments", "", "en")).toBe("/en/jornadas");
      expect(resolveLegacyRouteRedirect("/cadastro", "?a=1", "en")).toBe("/en/signup?a=1");
      expect(resolveLegacyRouteRedirect("/cadastro")).toBe("/pt/signup");
    });

    it("deve retornar null para rotas atuais ou válidas", () => {
      expect(resolveLegacyRouteRedirect("/pt/jornadas", "?page=1")).toBeNull();
      expect(resolveLegacyRouteRedirect("/en/resultados", "?page=2")).toBeNull();
      expect(resolveLegacyRouteRedirect("/pt/admin/resultados", "?userId=1")).toBeNull();
      expect(resolveLegacyRouteRedirect("/pt/signup")).toBeNull();
    });
  });

  describe("proxy (middleware)", () => {
    it("deve redirecionar permanentemente (308) /en/results?page=2 para /en/resultados?page=2", () => {
      const request = new NextRequest("http://localhost:3000/en/results?page=2");
      const response = proxy(request);

      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe("http://localhost:3000/en/resultados?page=2");
    });

    it("deve redirecionar permanentemente (308) /pt/assessments e /en/avaliacoes preservando parâmetros", () => {
      const reqAssessments = new NextRequest(
        "http://localhost:3000/pt/assessments?search=privacidade"
      );
      const resAssessments = proxy(reqAssessments);
      expect(resAssessments.status).toBe(308);
      expect(resAssessments.headers.get("location")).toBe(
        "http://localhost:3000/pt/jornadas?search=privacidade"
      );

      const reqAvaliacoes = new NextRequest("http://localhost:3000/en/avaliacoes?tab=all");
      const resAvaliacoes = proxy(reqAvaliacoes);
      expect(resAvaliacoes.status).toBe(308);
      expect(resAvaliacoes.headers.get("location")).toBe(
        "http://localhost:3000/en/jornadas?tab=all"
      );
    });

    it("deve redirecionar permanentemente (308) /cadastro para /signup mantendo idioma e parâmetros", () => {
      const response = proxy(new NextRequest("http://localhost:3000/en/cadastro?ref=login"));
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe("http://localhost:3000/en/signup?ref=login");

      const noLocale = proxy(
        new NextRequest("http://localhost:3000/cadastro", { headers: { cookie: "NEXT_LOCALE=en" } })
      );
      expect(noLocale.status).toBe(308);
      expect(noLocale.headers.get("location")).toBe("http://localhost:3000/en/signup");
    });

    it("deve preservar cookie NEXT_LOCALE ao redirecionar rota antiga sem prefixo", () => {
      const request = new NextRequest("http://localhost:3000/results?page=3", {
        headers: { cookie: "NEXT_LOCALE=en" },
      });
      const response = proxy(request);

      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe("http://localhost:3000/en/resultados?page=3");
    });
  });

  describe("next.config.ts redirects", () => {
    it("deve declarar redirecionamentos permanentes para todas as rotas legadas", async () => {
      const redirects = await nextConfig.redirects?.();

      expect(redirects).toEqual(
        expect.arrayContaining([
          {
            source: "/:locale(pt|en)/assessments",
            destination: "/:locale/jornadas",
            permanent: true,
          },
          { source: "/assessments", destination: "/jornadas", permanent: true },
          {
            source: "/:locale(pt|en)/avaliacoes",
            destination: "/:locale/jornadas",
            permanent: true,
          },
          { source: "/avaliacoes", destination: "/jornadas", permanent: true },
          {
            source: "/:locale(pt|en)/results",
            destination: "/:locale/resultados",
            permanent: true,
          },
          { source: "/results", destination: "/resultados", permanent: true },
          {
            source: "/:locale(pt|en)/cadastro",
            destination: "/:locale/signup",
            permanent: true,
          },
          { source: "/cadastro", destination: "/signup", permanent: true },
        ])
      );
    });
  });
});
