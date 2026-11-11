import type { AdminResultItem, AdminResultsLabels } from "../../adminResults.types";

export interface AdminResultsTableProps {
  results: AdminResultItem[];
  labels: Pick<
    AdminResultsLabels,
    | "tableUser"
    | "tableDepartment"
    | "tableProfile"
    | "tableDomain"
    | "tableCompletedAt"
    | "tableScore"
    | "tableActions"
    | "tableView"
    | "tableEmptyDepartment"
    | "scoreValue"
    | "scoreAriaLabel"
    | "formatDate"
  >;
}

export interface AdminResultsTableRow {
  id: string;
  userName: string;
  userEmail: string;
  userInitials: string;
  department: string;
  profileTitle: string;
  domainLabel: string;
  completedAt: string;
  formattedDate: string;
  scoreText: string;
  scoreBadgeClasses: string;
  scoreAriaLabel: string;
  resultHref: string;
  viewAriaLabel: string;
}

export interface AdminResultsTableViewModelReturn {
  rows: AdminResultsTableRow[];
  labels: AdminResultsTableProps["labels"];
}

