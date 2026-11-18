import { getAdminJourneyResultUrl } from "@shared/utils/journeyRoutes";
import { getScoreBadgeClasses } from "../../adminResults.utils";
import type {
  AdminResultsTableProps,
  AdminResultsTableRow,
  AdminResultsTableViewModelReturn,
} from "./adminResultsTable.types";

export function useAdminResultsTableVM(
  props: AdminResultsTableProps
): AdminResultsTableViewModelReturn {
  const { results, labels, listQuery } = props;

  const rows: AdminResultsTableRow[] = results.map((item) => ({
    id: item.id,
    userName: item.user.name,
    userEmail: item.user.email,
    userInitials: item.user.initials,
    department: item.user.department || labels.tableEmptyDepartment,
    profileTitle: item.profileTitle,
    domainLabel: item.domainLabel,
    completedAt: item.completedAt,
    formattedDate: labels.formatDate(item.completedAt),
    scoreText: labels.scoreValue(item.score),
    scoreBadgeClasses: getScoreBadgeClasses(item.scoreBand),
    scoreAriaLabel: labels.scoreAriaLabel(item.score, item.scoreBand),
    resultHref: getAdminJourneyResultUrl(item.journeyId, listQuery),
    viewAriaLabel: `${labels.tableView} — ${item.user.name} — ${item.profileTitle}`,
  }));

  return {
    rows,
    labels,
  };
}

