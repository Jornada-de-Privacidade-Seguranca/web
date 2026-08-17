import type { ResultCardProps } from "./resultCard.types";

export function useResultCardVM(props: ResultCardProps) {
  const { result, labels } = props;

  const score = result.score;
  const isHighScore = score >= 70;
  const isMediumScore = score >= 50 && score < 70;
  const isLowScore = score < 50;

  const actionHref = `/jornada/${result.id}/resultado`;

  const completedAtText = labels.completedAt(result.completedAt);
  const questionsText = labels.questionsCount(result.questionsCount);
  const buttonText = labels.viewResult;
  const ctaAriaLabel = `${buttonText} — ${result.title}`;

  return {
    result,
    score,
    isHighScore,
    isMediumScore,
    isLowScore,
    actionHref,
    completedAtText,
    questionsText,
    buttonText,
    ctaAriaLabel,
  };
}
