"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { usePermission } from "@hooks/usePermission";
import { getUsersList, getAccessProfiles } from "@services/usersService";
import { useAdminUsersStore } from "./adminUsers.store";
import type {
  AdminUsersViewModelReturn,
  AdminUsersTab,
  AdminUsersLabels,
  SelectOption,
} from "./adminUsers.types";

const DEPARTMENTS_LIST = [
  "Tecnologia da Informação",
  "Jurídico",
  "Recursos Humanos",
  "Segurança da Informação",
  "Compliance",
  "Operações",
  "Financeiro",
];

export function useAdminUsersVM(): AdminUsersViewModelReturn {
  const t = useTranslations("adminUsers");
  const { can } = usePermission();

  const canInviteUsers = can("users.register");
  const invitedEmail = useAdminUsersStore((s) => s.invitedEmail);
  const clearInvitedEmail = useAdminUsersStore((s) => s.clearInvitedEmail);

  const inviteSuccessMessage = invitedEmail
    ? t("inviteSuccess", { email: invitedEmail })
    : null;

  const handleDismissInviteMessage = useCallback(() => {
    clearInvitedEmail();
  }, [clearInvitedEmail]);

  useEffect(() => {
    return () => {
      clearInvitedEmail();
    };
  }, [clearInvitedEmail]);

  const [currentTab, setCurrentTab] = useState<AdminUsersTab>("users");
  const [page, setPage] = useState<number>(1);

  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(term);
      setPage(1);
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleDepartmentChange = useCallback((dept: string) => {
    setDepartment(dept);
    setPage(1);
  }, []);

  const handleRoleChange = useCallback((newRole: string) => {
    setRole(newRole);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setDepartment("");
    setRole("");
    setStatus("");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleTabChange = useCallback((tab: AdminUsersTab) => {
    setCurrentTab(tab);
  }, []);

  // TanStack Queries
  const usersQuery = useQuery({
    queryKey: [
      "admin",
      "users",
      page,
      debouncedSearch,
      department,
      role,
      status,
    ],
    queryFn: () =>
      getUsersList({
        page,
        limit: 6,
        search: debouncedSearch,
        department,
        role,
        status,
      }),
    retry: false,
  });

  const profilesQuery = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: getAccessProfiles,
    retry: false,
  });

  const users = usersQuery.data?.items ?? [];
  const totalUsers = usersQuery.data?.total ?? 0;
  const filteredTotal = usersQuery.data?.filteredTotal ?? 0;
  const totalPages = usersQuery.data?.totalPages ?? 1;

  const isLoading = usersQuery.isLoading;
  const isError = usersQuery.isError;
  const errorMessage = usersQuery.error
    ? t("error.message")
    : null;

  const handleRetry = useCallback(() => {
    void usersQuery.refetch();
    void profilesQuery.refetch();
  }, [usersQuery, profilesQuery]);

  const hasActiveFilters =
    debouncedSearch.trim().length > 0 ||
    department !== "" ||
    role !== "" ||
    status !== "";

  const availableRoles: SelectOption[] = useMemo(
    () => [
      { value: "admin", label: t("filters.role") + " — " + "Administrador" },
      { value: "manager", label: t("filters.role") + " — " + "Gestor" },
      { value: "user", label: t("filters.role") + " — " + "Usuário" },
    ],
    [t]
  );

  const availableStatuses: SelectOption[] = useMemo(
    () => [
      { value: "active", label: t("filters.active") },
      { value: "pending", label: t("filters.pending") },
      { value: "inactive", label: t("filters.inactive") },
    ],
    [t]
  );

  const labels: AdminUsersLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    tabUsers: t("tabs.users"),
    tabRoles: t("tabs.roles"),
    searchPlaceholder: t("searchPlaceholder"),
    filterDepartment: t("filters.department"),
    filterAllDepartments: t("filters.allDepartments"),
    filterRole: t("filters.role"),
    filterAllRoles: t("filters.allRoles"),
    filterStatus: t("filters.status"),
    filterAllStatuses: t("filters.allStatuses"),
    filterStatusActive: t("filters.active"),
    filterStatusPending: t("filters.pending"),
    filterStatusInactive: t("filters.inactive"),
    filterClear: t("filters.clear"),
    filterCounter: (filtered: number, total: number) =>
      t("filters.counter", { filtered, total }),
    tableUser: t("table.user"),
    tableEmployeeCode: t("table.employeeCode"),
    tableDepartment: t("table.department"),
    tableRole: t("table.role"),
    tableStatus: t("table.status"),
    tableJourneys: t("table.journeys"),
    tableActions: t("table.actions"),
    tableManage: t("table.manage"),
    rolesTitle: t("rolesTab.title"),
    rolesSubtitle: t("rolesTab.subtitle"),
    rolesDefaultBadge: t("rolesTab.defaultBadge"),
    rolesPermissionsTitle: t("rolesTab.permissionsTitle"),
    rolesHistoryNotice: t("rolesTab.historyNotice"),
    emptyTitle: t("empty.title"),
    emptyDescription: t("empty.description"),
    emptyClearButton: t("empty.clearButton"),
    paginationPrevious: t("pagination.previous"),
    paginationNext: t("pagination.next"),
    paginationPageOf: (current: number, total: number) =>
      t("pagination.pageOf", { current, total }),
    errorTitle: t("error.title"),
    errorMessage: t("error.message"),
    retryButton: t("error.retry"),
    inviteButton: t("inviteButton"),
    closeMessage: t("closeMessage"),
  };

  const accessProfiles = useMemo(
    () =>
      (profilesQuery.data ?? []).map((profile) =>
        profile.id === "manager"
          ? { ...profile, description: t("rolesTab.descriptions.manager") }
          : profile
      ),
    [profilesQuery.data, t]
  );

  return {
    currentTab,
    handleTabChange,

    users,
    totalUsers,
    filteredTotal,
    page,
    totalPages,
    handlePageChange,

    isLoading,
    isError,
    errorMessage,
    handleRetry,

    filters: {
      search: searchTerm,
      department,
      role,
      status,
    },
    availableDepartments: DEPARTMENTS_LIST,
    availableRoles,
    availableStatuses,
    handleSearchChange,
    handleDepartmentChange,
    handleRoleChange,
    handleStatusChange,
    handleClearFilters,
    hasActiveFilters,

    accessProfiles,
    isProfilesLoading: profilesQuery.isLoading,

    canInviteUsers,
    inviteSuccessMessage,
    handleDismissInviteMessage,

    labels,
  };
}
