import type { JourneySummarySkeletonViewModelReturn } from "./journeySummarySkeleton.types";

const STAT_CARDS_COUNT = 4;
const STEPS_COUNT = 6;

export function useJourneySummarySkeletonVM(): JourneySummarySkeletonViewModelReturn {
  return {
    statCardKeys: Array.from({ length: STAT_CARDS_COUNT }, (_, index) => index),
    stepKeys: Array.from({ length: STEPS_COUNT }, (_, index) => index),
  };
}
