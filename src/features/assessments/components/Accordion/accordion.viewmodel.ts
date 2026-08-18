import { useState } from "react";
import type { AccordionProps } from "./accordion.types";

export function useAccordionVM(props: AccordionProps) {
  const { title, subtitle, count, defaultOpen = true, children } = props;
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    title,
    subtitle,
    count,
    isOpen,
    toggle,
    children,
  };
}
