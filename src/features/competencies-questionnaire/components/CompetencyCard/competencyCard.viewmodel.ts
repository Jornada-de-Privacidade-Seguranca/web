import type { KeyboardEvent } from "react";
import type {
  CompetencyCardOption,
  CompetencyCardProps,
  CompetencyCardViewModelReturn,
} from "./competencyCard.types";

const NAVIGATION_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

export function useCompetencyCardVM(props: CompetencyCardProps): CompetencyCardViewModelReturn {
  const disabled = props.disabled ?? false;

  const options: CompetencyCardOption[] = [
    {
      value: true,
      label: props.yesLabel,
      isChecked: props.answer === true,
      tabIndex: props.answer === false ? -1 : 0,
    },
    {
      value: false,
      label: props.noLabel,
      isChecked: props.answer === false,
      tabIndex: props.answer === false ? 0 : -1,
    },
  ];

  const handleSelect = (value: boolean) => {
    if (!disabled) props.onAnswer(value);
  };

  // Padrão de radiogroup: as setas alternam entre "Sim" e "Não" e marcam a opção
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, value: boolean) => {
    if (!NAVIGATION_KEYS.includes(event.key)) return;
    event.preventDefault();
    const nextValue = !value;
    handleSelect(nextValue);
    const group = event.currentTarget.parentElement;
    const target = group?.querySelector<HTMLButtonElement>(`[data-value="${nextValue}"]`);
    target?.focus();
  };

  return {
    titleId: `competency-${props.id}-title`,
    name: props.name,
    description: props.description,
    difficulty: props.difficulty,
    difficultyPrefix: props.difficultyPrefix,
    options,
    disabled,
    handleSelect,
    handleKeyDown,
  };
}
