import { describe, it, expect } from "vitest";
import {
  buildSessionExpiredLoginPath,
  getSafeRedirectPath,
  isSessionExpiredLogin,
  readLoginRedirectPath,
} from "../loginRedirect";

describe("getSafeRedirectPath", () => {
  it("deve aceitar caminhos internos, preservando a query string", () => {
    expect(getSafeRedirectPath("/jornadas")).toBe("/jornadas");
    expect(getSafeRedirectPath("/jornada/12/resultado?aba=areas")).toBe(
      "/jornada/12/resultado?aba=areas"
    );
  });

  it.each([
    ["URL absoluta", "https://site-malicioso.com"],
    ["caminho relativo ao protocolo", "//site-malicioso.com"],
    ["barra invertida", "/\\site-malicioso.com"],
    ["esquema javascript", "javascript:alert(1)"],
    ["caminho relativo", "jornadas"],
    ["valor vazio", ""],
  ])("deve recusar %s", (_, value) => {
    expect(getSafeRedirectPath(value)).toBeNull();
  });

  it("deve recusar a própria tela de login, para não criar um ciclo", () => {
    expect(getSafeRedirectPath("/login?redirect=%2Fjornadas")).toBeNull();
    expect(getSafeRedirectPath("/en/login")).toBeNull();
  });

  it("deve remover o prefixo de idioma, que o router já acrescenta", () => {
    expect(getSafeRedirectPath("/en/jornadas?page=2")).toBe("/jornadas?page=2");
    expect(getSafeRedirectPath("/pt")).toBe("/");
    // Só o idioma no início do caminho
    expect(getSafeRedirectPath("/jornadas/en")).toBe("/jornadas/en");
    expect(getSafeRedirectPath("/english")).toBe("/english");
  });

  it("deve recusar o que vira caminho relativo ao protocolo sem o idioma", () => {
    expect(getSafeRedirectPath("/en//site-malicioso.com")).toBeNull();
  });
});

describe("buildSessionExpiredLoginPath", () => {
  it("deve levar ao login com o motivo e a página atual", () => {
    expect(buildSessionExpiredLoginPath("/jornadas?page=2")).toBe(
      "/login?reason=session_expired&redirect=%2Fjornadas%3Fpage%3D2"
    );
  });

  it("deve omitir a página de retorno quando ela não for um caminho interno", () => {
    expect(buildSessionExpiredLoginPath("//site-malicioso.com")).toBe(
      "/login?reason=session_expired"
    );
  });
});

describe("isSessionExpiredLogin", () => {
  it("deve identificar a chegada ao login pela expiração da sessão", () => {
    expect(isSessionExpiredLogin("?reason=session_expired&redirect=%2Fjornadas")).toBe(true);
    expect(isSessionExpiredLogin("?redirect=%2Fjornadas")).toBe(false);
  });
});

describe("readLoginRedirectPath", () => {
  it("deve ler a página de retorno do login", () => {
    expect(readLoginRedirectPath("?redirect=%2Fresultados")).toBe("/resultados");
  });

  it("deve descartar uma página de retorno externa", () => {
    expect(readLoginRedirectPath("?redirect=https%3A%2F%2Fsite-malicioso.com")).toBeNull();
  });
});
