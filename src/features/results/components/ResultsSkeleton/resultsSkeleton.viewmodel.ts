import type { ResultsSkeletonProps } from "./resultsSkeleton.types";

export function useResultsSkeletonVM(props: ResultsSkeletonProps) {
  const count = props.count ?? 6;
  const items = Array.from({ length: count }, (_, i) => i);
  return { items };
}
