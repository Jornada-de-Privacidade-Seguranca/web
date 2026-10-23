import { describe, it, expect, beforeEach } from "vitest";
import { useCompetenciesQuestionnaireStore } from "../competenciesQuestionnaire.store";

describe("useCompetenciesQuestionnaireStore", () => {
  beforeEach(() => {
    useCompetenciesQuestionnaireStore.getState().reset();
  });

  it("deve carregar as respostas de uma jornada e acumular novas respostas", () => {
    const store = useCompetenciesQuestionnaireStore;
    store.getState().hydrate("78", { 12: true });
    store.getState().setAnswer(13, false);
    store.getState().setAnswer(12, false);

    expect(store.getState().journeyId).toBe("78");
    expect(store.getState().answers).toEqual({ 12: false, 13: false });
  });

  it("deve limpar a jornada e as respostas no reset", () => {
    const store = useCompetenciesQuestionnaireStore;
    store.getState().hydrate("78", { 12: true });
    store.getState().reset();

    expect(store.getState().journeyId).toBeNull();
    expect(store.getState().answers).toEqual({});
  });
});
