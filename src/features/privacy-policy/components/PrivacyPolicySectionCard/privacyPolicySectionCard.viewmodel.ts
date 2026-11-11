import type {
  PrivacyPolicySectionCardProps,
  PrivacyPolicySectionCardViewModelReturn,
} from "./privacyPolicySectionCard.types";

export function usePrivacyPolicySectionCardVM(
  props: PrivacyPolicySectionCardProps
): PrivacyPolicySectionCardViewModelReturn {
  const { section } = props;
  const bullets = section.bullets ?? [];

  return {
    id: section.id,
    headingId: `${section.id}-heading`,
    number: section.number,
    icon: section.icon,
    title: section.title,
    paragraphs: section.paragraphs,
    bullets,
    hasBullets: bullets.length > 0,
  };
}

