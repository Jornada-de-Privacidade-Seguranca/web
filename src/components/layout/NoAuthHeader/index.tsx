import { SwitchThemeButton } from "../SwitchThemeButton";
import { IdiomSwitch } from "../IdiomSwitch";

export const NoAuthHeader = () => {
  return (
    <header className="flex w-full items-center p-4 gap-2">
      <IdiomSwitch />
      <SwitchThemeButton />
    </header>
  );
};
