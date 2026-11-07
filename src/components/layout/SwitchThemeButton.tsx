import { useTheme } from "@/hooks/useTheme";
import { Button } from "../ui";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon, ContrastIcon } from "@hugeicons/core-free-icons";

export const SwitchThemeButton = (props: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("switchThemeButton");

  const getAriaLabel = () => {
    switch (theme) {
      case "light":
        return t("dark");
      case "dark":
        return t("highContrast");
      case "high-contrast":
      default:
        return t("light");
    }
  };

  const renderIcon = () => {
    switch (theme) {
      case "high-contrast":
        return <HugeiconsIcon icon={ContrastIcon} />;
      case "dark":
        return <HugeiconsIcon icon={Moon02Icon} />;
      case "light":
      default:
        return <HugeiconsIcon icon={Sun03Icon} />;
    }
  };

  return (
    <Button
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
      size="icon"
      onClick={toggleTheme}
      className={props.className}
    >
      {renderIcon()}
    </Button>
  );
};
