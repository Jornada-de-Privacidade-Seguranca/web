import React from "react";

export interface AccordionProps {
  title: string;
  subtitle?: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}
