import type { ResultCardProps, ResultCardViewModelReturn } from "./resultCard.types";

export function useResultCardVM(props: ResultCardProps): ResultCardViewModelReturn {
  const { result, labels } = props;

  const title = result.title;
  const domainLabel =
    result.domainLabel ||
    (result.domain === "privacy"
      ? labels.filterDomainPrivacy
      : result.domain === "security"
      ? labels.filterDomainSecurity
      : result.domain === "joint"
      ? labels.filterDomainJoint
      : null);

  const completedTagText = labels.completedScoreTag(result.score);
  const completedAtText = labels.completedAt(result.completedAt);
  const buttonText = labels.viewResult;
  const actionHref = `/jornada/${result.id}/resultado`;
  const ctaAriaLabel = `${buttonText} — ${title}`;
  const badgeAriaLabel = labels.scoreAriaLabel(result.score);

  return {
    title,
    domainLabel,
    completedTagText,
    completedAtText,
    actionHref,
    buttonText,
    ctaAriaLabel,
    badgeAriaLabel,
  };
}
