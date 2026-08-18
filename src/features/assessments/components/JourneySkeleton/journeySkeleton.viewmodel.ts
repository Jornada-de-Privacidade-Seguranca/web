import type { JourneySkeletonProps } from "./journeySkeleton.types";

export function useJourneySkeletonVM(props: JourneySkeletonProps) {
  const count = props.count ?? 6;
  const items = Array.from({ length: count }, (_, i) => i);
  return { items };
}
