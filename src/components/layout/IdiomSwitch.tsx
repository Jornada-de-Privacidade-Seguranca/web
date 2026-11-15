"use client";

import { useLang } from "@/hooks/useLang";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface IdiomSwitchProps {
  className?: string;
}

export const IdiomSwitch = ({ className }: IdiomSwitchProps) => {
  const { locale, changeLocale, locales } = useLang();

  return (
    <div
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border bg-secondary p-0.5",
        className,
      )}
    >
      {locales.map((myLocale) => (
        <Button
          key={myLocale}
          variant={myLocale === locale ? "default" : "ghost"}
          aria-pressed={myLocale === locale}
          onClick={() => changeLocale(myLocale)}
        >
          {myLocale.toUpperCase()}
        </Button>
      ))}
    </div>
  );
};
