import type {
  UserCompletedJourney,
  AdminUserDetailLabels,
} from "../../adminUserDetail.types";

export interface UserJourneysSectionProps {
  userId: string;
  journeys: UserCompletedJourney[];
  labels: AdminUserDetailLabels;
}

export interface UserJourneysSectionViewModelReturn {
  journeys: UserCompletedJourney[];
  allResultsHref: string;
  labels: AdminUserDetailLabels;
  hasJourneys: boolean;
}
