import { create } from "zustand";
import type { CompetenciesQuestionnaireStoreState } from "./competenciesQuestionnaire.types";

/**
 * Respostas acumuladas enquanto o usuário navega entre as áreas. Cada área é
 * uma rota, então o estado precisa sobreviver à troca de página. As respostas
 * pertencem a uma jornada: ao abrir outra jornada, são recarregadas das salvas.
 */
export const useCompetenciesQuestionnaireStore = create<CompetenciesQuestionnaireStoreState>(
  (set) => ({
    journeyId: null,
    answers: {},
    hydrate: (journeyId, answers) => set({ journeyId, answers }),
    setAnswer: (competencyId, acquired) =>
      set((state) => ({ answers: { ...state.answers, [competencyId]: acquired } })),
    reset: () => set({ journeyId: null, answers: {} }),
  })
);
