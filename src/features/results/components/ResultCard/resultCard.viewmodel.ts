import type { ResultCardProps } from "./resultCard.types";

export function useResultCardVM(props: ResultCardProps) {
  const { result, labels } = props;

  const score = result.score;
  const isHighScore = score >= 75;
  const isMediumScore = score >= 60 && score < 75;
  const isLowScore = score < 60;

  const actionHref = `/jornada/${result.id}/resultado`;

  const completedAtText = labels.completedAt(result.completedAt);
  const buttonText = labels.viewResult;
  const ctaAriaLabel = `${buttonText} — ${result.title}`;
  const badgeAriaLabel = `Nota: ${score}`;

  return {
    result,
    score,
    isHighScore,
    isMediumScore,
    isLowScore,
    actionHref,
    completedAtText,
    buttonText,
    ctaAriaLabel,
    badgeAriaLabel,
  };
}
