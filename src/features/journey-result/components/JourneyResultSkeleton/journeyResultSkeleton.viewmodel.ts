import type { JourneyResultSkeletonViewModelReturn } from "./journeyResultSkeleton.types";

const SECTION_KEYS = ["profile", "declared", "undeclared"];
const AREA_CARD_KEYS = ["area-1", "area-2", "area-3"];

export function useJourneyResultSkeletonVM(): JourneyResultSkeletonViewModelReturn {
  return { sectionKeys: SECTION_KEYS, areaCardKeys: AREA_CARD_KEYS };
}
