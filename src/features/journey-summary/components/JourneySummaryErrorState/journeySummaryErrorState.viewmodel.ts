"use client";

import { useEffect } from "react";
import type {
  JourneySummaryErrorStateProps,
  JourneySummaryErrorStateViewModelReturn,
} from "./journeySummaryErrorState.types";

const BACK_LINK_ID = "journey-summary-back-link";

/** O link de volta recebe foco automaticamente: é a única ação disponível na tela de erro. */
export function useJourneySummaryErrorStateVM(
  props: JourneySummaryErrorStateProps
): JourneySummaryErrorStateViewModelReturn {
  useEffect(() => {
    document.getElementById(BACK_LINK_ID)?.focus();
  }, []);

  return { ...props, backLinkId: BACK_LINK_ID };
}
