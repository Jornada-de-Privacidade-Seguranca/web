// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getSessionActivitySnapshot,
  recordSessionActivity,
  resetSessionActivity,
  subscribeSessionActivity,
} from "../sessionActivity";

const LAST_ACTIVITY_KEY = "jornada:session-last-activity";

describe("sessionActivity", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetSessionActivity();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve começar sem atividade nem tempo de vida conhecidos", () => {
    expect(getSessionActivitySnapshot()).toEqual({ lastActivityAt: null, lifetimeMinutes: null });
  });

  it("deve guardar a atividade no localStorage, para as outras abas", () => {
    recordSessionActivity(120, 1_000);

    expect(window.localStorage.getItem(LAST_ACTIVITY_KEY)).toBe("1000");
    expect(getSessionActivitySnapshot()).toEqual({ lastActivityAt: 1_000, lifetimeMinutes: 120 });
  });

  it("deve partir da atividade já registrada por outra aba", () => {
    window.localStorage.setItem(LAST_ACTIVITY_KEY, "5000");

    expect(getSessionActivitySnapshot().lastActivityAt).toBe(5_000);
  });

  it("não deve voltar a última atividade para trás", () => {
    recordSessionActivity(120, 2_000);
    recordSessionActivity(undefined, 1_000);

    expect(getSessionActivitySnapshot()).toEqual({ lastActivityAt: 2_000, lifetimeMinutes: 120 });
  });

  it("deve avisar quem acompanha a atividade desta aba e, pelo evento storage, a das outras", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSessionActivity(listener);

    recordSessionActivity(120, 1_000);
    expect(listener).toHaveBeenCalledTimes(1);

    window.localStorage.setItem(LAST_ACTIVITY_KEY, "9000");
    window.dispatchEvent(new StorageEvent("storage", { key: LAST_ACTIVITY_KEY, newValue: "9000" }));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(getSessionActivitySnapshot()).toEqual({ lastActivityAt: 9_000, lifetimeMinutes: 120 });

    // Outras chaves do localStorage não interessam
    window.dispatchEvent(new StorageEvent("storage", { key: "outra-chave", newValue: "1" }));
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    recordSessionActivity(undefined, 10_000);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("deve continuar acompanhando a aba atual sem o localStorage", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });

    recordSessionActivity(120, 1_000);

    expect(getSessionActivitySnapshot()).toEqual({ lastActivityAt: 1_000, lifetimeMinutes: 120 });
  });
});
