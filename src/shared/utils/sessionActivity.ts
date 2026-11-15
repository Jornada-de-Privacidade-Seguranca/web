/**
 * Última atividade da sessão e tempo de vida informado pelo backend, usados
 * para prever o vencimento da sessão. Cada resposta bem-sucedida da API renova
 * a sessão, então o vencimento previsto é a última atividade mais o tempo de
 * vida. A última atividade fica no localStorage para ser compartilhada entre as
 * abas: o evento `storage` avisa as outras abas a cada nova resposta.
 * O armazenamento pode estar indisponível (modo privado, bloqueio de dados);
 * nesse caso, cada aba acompanha só a própria atividade.
 */
const LAST_ACTIVITY_KEY = "jornada:session-last-activity";

export interface SessionActivitySnapshot {
  /** Horário (ms) da última resposta bem-sucedida da API, em qualquer aba. */
  lastActivityAt: number | null;
  /** Tempo de vida da sessão, em minutos, recebido em `meta.session.lifetime_minutes`. */
  lifetimeMinutes: number | null;
}

const EMPTY_SNAPSHOT: SessionActivitySnapshot = {
  lastActivityAt: null,
  lifetimeMinutes: null,
};

let snapshot: SessionActivitySnapshot | null = null;
const listeners = new Set<() => void>();

function readStoredActivity(): number | null {
  try {
    const stored = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  } catch {
    return null;
  }
}

function currentSnapshot(): SessionActivitySnapshot {
  snapshot ??= { lastActivityAt: readStoredActivity(), lifetimeMinutes: null };
  return snapshot;
}

function update(changes: Partial<SessionActivitySnapshot>): void {
  snapshot = { ...currentSnapshot(), ...changes };
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== LAST_ACTIVITY_KEY && event.key !== null) return;
  const lastActivityAt = readStoredActivity();
  if (lastActivityAt !== currentSnapshot().lastActivityAt) {
    update({ lastActivityAt });
  }
}

/**
 * Registra uma resposta bem-sucedida da API e, quando ela traz, o tempo de vida
 * da sessão. Nunca volta a última atividade para trás: uma resposta lenta que
 * chega depois de outra mais recente não antecipa o vencimento.
 */
export function recordSessionActivity(lifetimeMinutes?: number, at = Date.now()): void {
  const current = currentSnapshot();
  const lastActivityAt = Math.max(at, current.lastActivityAt ?? 0);
  try {
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivityAt));
  } catch {
    // Sem armazenamento: a atividade fica só nesta aba
  }
  update({
    lastActivityAt,
    lifetimeMinutes: lifetimeMinutes ?? current.lifetimeMinutes,
  });
}

export function getSessionActivitySnapshot(): SessionActivitySnapshot {
  return currentSnapshot();
}

/** No servidor não há atividade nem tempo de vida conhecidos. */
export function getServerSessionActivitySnapshot(): SessionActivitySnapshot {
  return EMPTY_SNAPSHOT;
}

/** Acompanha a atividade desta aba e, pelo evento `storage`, a das outras abas. */
export function subscribeSessionActivity(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
  };
}

/** Uso exclusivo dos testes: esquece a atividade e o tempo de vida conhecidos. */
export function resetSessionActivity(): void {
  snapshot = null;
}
