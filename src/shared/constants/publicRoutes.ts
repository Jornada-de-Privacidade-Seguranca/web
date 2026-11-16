/** Página do link do convite. Fica em português porque é o link que o backend gera. */
export const INITIAL_PASSWORD_PATH = "/definir-senha-inicial";

/** Páginas públicas que também abrem para quem já está logado, sem levar ao painel. */
export const GUEST_GUARD_EXEMPT_PATHS: readonly string[] = [INITIAL_PASSWORD_PATH];
