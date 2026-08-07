import { useTheme } from "@/hooks/useTheme";
import { Button } from "../ui";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

export const SwitchThemeButton = (props: { className?: string }) => {
  const { isDark, toggleTheme } = useTheme();
  const t = useTranslations();

  return (
    <Button
      aria-label={t(`switchThemeButton.${!isDark ? "dark" : "light"}`)}
      size="icon"
      onClick={toggleTheme}
      className={props.className}
    >
      <HugeiconsIcon icon={isDark ? Moon02Icon : Sun03Icon} />
    </Button>
  );
};
