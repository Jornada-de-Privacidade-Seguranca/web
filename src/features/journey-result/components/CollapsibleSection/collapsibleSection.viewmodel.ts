import { useId, useState } from "react";
import type {
  CollapsibleSectionProps,
  CollapsibleSectionViewModelReturn,
} from "./collapsibleSection.types";

export function useCollapsibleSectionVM(
  props: Pick<CollapsibleSectionProps, "defaultOpen">
): CollapsibleSectionViewModelReturn {
  const [isOpen, setIsOpen] = useState(props.defaultOpen ?? true);
  const id = useId();

  return {
    isOpen,
    buttonId: `${id}-button`,
    contentId: `${id}-content`,
    handleToggle: () => setIsOpen((open) => !open),
  };
}
