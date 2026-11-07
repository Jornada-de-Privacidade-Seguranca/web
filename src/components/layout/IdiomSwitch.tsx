"use client";

import { useLang } from "@/hooks/useLang";
import { Button } from "@/components/ui/button";

export const IdiomSwitch = () => {
  const { locale, changeLocale, locales } = useLang();

  return (
    <div className="flex gap-1 border bg-secondary rounded-full p-0.5 ml-auto">
      {locales.map((myLocale, index) => (
        <Button
          key={index}
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
