import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const IdiomSwitch = () => {
  const { locale, changeLocale, locales } = useLang();

  return (
    <div className="flex gap-1 border bg-secondary rounded-full p-0.5 ml-auto">
      {locales.map((myLocale, index) => (
        <Button
          key={index}
          className={cn(locale === myLocale && "border-transparent!")}
          variant={myLocale === locale ? "default" : "ghost"}
          onClick={() => changeLocale(myLocale)}
        >
          {myLocale.toUpperCase()}
        </Button>
      ))}
    </div>
  );
};

export const NoAuthHeader = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex w-full items-center p-4 gap-2">
      <IdiomSwitch />
      <Button size="icon" onClick={toggleTheme}>
        <HugeiconsIcon icon={isDark ? Moon02Icon : Sun03Icon} />
      </Button>
    </header>
  );
};
