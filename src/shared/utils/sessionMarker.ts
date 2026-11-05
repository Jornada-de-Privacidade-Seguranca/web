/**
 * Marca, no navegador, que o usuário entrou e não saiu pelo logout. Serve para
 * diferenciar uma sessão expirada (havia sessão) de um acesso sem login.
 * O armazenamento pode estar indisponível (modo privado, bloqueio de dados);
 * nesse caso, a marca simplesmente não existe.
 */
const SESSION_MARKER_KEY = "jornada:had-session";

export function markSessionStarted(): void {
  try {
    window.localStorage.setItem(SESSION_MARKER_KEY, "1");
  } catch {
    // Sem armazenamento: a expiração passa a ser tratada como acesso sem login
  }
}

export function clearSessionMarker(): void {
  try {
    window.localStorage.removeItem(SESSION_MARKER_KEY);
  } catch {
    // Sem armazenamento: não há marca para remover
  }
}

export function hadPreviousSession(): boolean {
  try {
    return window.localStorage.getItem(SESSION_MARKER_KEY) === "1";
  } catch {
    return false;
  }
}
