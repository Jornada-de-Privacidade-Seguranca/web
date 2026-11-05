export const LOGIN_PATH = "/login";
export const DEFAULT_AUTHENTICATED_PATH = "/painel";

/** Valor de `reason` que indica que o usuário chegou ao login pela expiração da sessão. */
export const SESSION_EXPIRED_REASON = "session_expired";

const REASON_PARAM = "reason";
const REDIRECT_PARAM = "redirect";

/** Base fictícia usada só para resolver o caminho e conferir que ele não muda de origem. */
const INTERNAL_ORIGIN = "http://internal.invalid";

/**
 * Aceita apenas caminhos internos do app ("/jornadas?page=2"), para evitar
 * redirecionamento aberto. Recusa URLs absolutas, caminhos relativos ao
 * protocolo ("//site.com", "/\site.com") e a própria tela de login.
 */
export function getSafeRedirectPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(value, INTERNAL_ORIGIN);
  } catch {
    return null;
  }

  if (url.origin !== INTERNAL_ORIGIN || url.pathname === LOGIN_PATH) {
    return null;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Monta o caminho do login após a expiração da sessão: informa o motivo, para o
 * aviso na tela, e guarda a página atual, para voltar a ela depois de entrar.
 */
export function buildSessionExpiredLoginPath(currentPath: string): string {
  const params = new URLSearchParams({ [REASON_PARAM]: SESSION_EXPIRED_REASON });
  const redirectPath = getSafeRedirectPath(currentPath);
  if (redirectPath) {
    params.set(REDIRECT_PARAM, redirectPath);
  }
  return `${LOGIN_PATH}?${params.toString()}`;
}

/** Indica se o usuário chegou ao login pela expiração da sessão. */
export function isSessionExpiredLogin(search: string): boolean {
  return new URLSearchParams(search).get(REASON_PARAM) === SESSION_EXPIRED_REASON;
}

/** Lê a página de retorno do login a partir da query string (só caminhos internos). */
export function readLoginRedirectPath(search: string): string | null {
  return getSafeRedirectPath(new URLSearchParams(search).get(REDIRECT_PARAM));
}

/** Página de retorno do login na URL atual; no servidor, devolve `null`. */
export function readCurrentLoginRedirectPath(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return readLoginRedirectPath(window.location.search);
}
