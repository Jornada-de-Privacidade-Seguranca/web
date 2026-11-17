"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { usePermission } from "@hooks/usePermission";
import {
  getUsersList,
  getAccessProfiles,
  getUserDepartments,
} from "@services/usersService";
import { useAdminUsersStore } from "./adminUsers.store";
import type {
  AdminUsersViewModelReturn,
  AdminUsersTab,
  AdminUsersLabels,
  SelectOption,
  UserRole,
  UserStatus,
} from "./adminUsers.types";

export const USERS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const ROLES: UserRole[] = ["admin", "manager", "user"];
const STATUSES: UserStatus[] = ["active", "pending", "inactive"];

/** Parâmetros da URL usados pela listagem. */
const PARAM = {
  search: "search",
  department: "department",
  role: "role",
  status: "status",
  page: "page",
} as const;

type ListParam = (typeof PARAM)[keyof typeof PARAM];

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseOption<T extends string>(value: string | null, options: T[]): T | "" {
  return value && (options as string[]).includes(value) ? (value as T) : "";
}

export function useAdminUsersVM(): AdminUsersViewModelReturn {
  const t = useTranslations("adminUsers");
  const locale = useLocale() === "en" ? "en" : "pt";
  const { can } = usePermission();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const canInviteUsers = can("users.register");
  const clearInvitedEmail = useAdminUsersStore((s) => s.clearInvitedEmail);
  const clearDeletedUserName = useAdminUsersStore((s) => s.clearDeletedUserName);
  const setListQuery = useAdminUsersStore((s) => s.setListQuery);

  // Os avisos vindos do convite e da exclusão são lidos uma vez, ao abrir a tela, e
  // saem do store logo em seguida. Limpar no unmount apagaria o aviso no StrictMode
  // (o React desmonta e monta de novo em desenvolvimento)
  const [invitedEmail, setInvitedEmail] = useState<string | null>(
    () => useAdminUsersStore.getState().invitedEmail
  );
  const [deletedUserName, setDeletedUserName] = useState<string | null>(
    () => useAdminUsersStore.getState().deletedUserName
  );

  useEffect(() => {
    clearInvitedEmail();
    clearDeletedUserName();
  }, [clearInvitedEmail, clearDeletedUserName]);

  const inviteSuccessMessage = invitedEmail
    ? t("inviteSuccess", { email: invitedEmail })
    : null;
  const deleteSuccessMessage = deletedUserName
    ? t("deleteSuccess", { name: deletedUserName })
    : null;

  const handleDismissInviteMessage = useCallback(() => {
    setInvitedEmail(null);
  }, []);

  const handleDismissDeleteMessage = useCallback(() => {
    setDeletedUserName(null);
  }, []);

  // A busca, os filtros e a página vêm da URL, para o "Voltar" do detalhe manter o estado
  const queryString = searchParams?.toString() ?? "";
  const urlSearch = searchParams?.get(PARAM.search) ?? "";
  const department = searchParams?.get(PARAM.department) ?? "";
  const role = parseOption(searchParams?.get(PARAM.role) ?? null, ROLES);
  const status = parseOption(searchParams?.get(PARAM.status) ?? null, STATUSES);
  const page = parsePage(searchParams?.get(PARAM.page) ?? null);

  // Última query enviada à URL: mudanças seguidas não se sobrescrevem antes da URL atualizar
  const latestQueryRef = useRef(queryString);

  useEffect(() => {
    latestQueryRef.current = queryString;
    setListQuery(queryString);
  }, [queryString, setListQuery]);

  const updateParams = useCallback(
    (changes: Partial<Record<ListParam, string | number | null>>) => {
      const next = new URLSearchParams(latestQueryRef.current);
      (Object.keys(changes) as ListParam[]).forEach((key) => {
        const value = changes[key];
        if (value === null || value === undefined || value === "" || (key === PARAM.page && value === 1)) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      const nextQuery = next.toString();
      latestQueryRef.current = nextQuery;
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const [currentTab, setCurrentTab] = useState<AdminUsersTab>("users");

  // O campo de busca responde na hora; a URL (e a consulta) só depois da pausa na digitação
  const [searchTerm, setSearchTerm] = useState<string>(urlSearch);
  const lastSyncedSearchRef = useRef<string>(urlSearch);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // A URL mudou por fora (limpar filtros, voltar no navegador): o campo acompanha
    if (urlSearch !== lastSyncedSearchRef.current) {
      lastSyncedSearchRef.current = urlSearch;
      setSearchTerm(urlSearch);
    }
  }, [urlSearch]);

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const trimmed = term.trim();
        lastSyncedSearchRef.current = trimmed;
        updateParams({ [PARAM.search]: trimmed, [PARAM.page]: null });
      }, SEARCH_DEBOUNCE_MS);
    },
    [updateParams]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleDepartmentChange = useCallback(
    (dept: string) => updateParams({ [PARAM.department]: dept, [PARAM.page]: null }),
    [updateParams]
  );

  const handleRoleChange = useCallback(
    (newRole: string) =>
      updateParams({ [PARAM.role]: parseOption(newRole, ROLES), [PARAM.page]: null }),
    [updateParams]
  );

  const handleStatusChange = useCallback(
    (newStatus: string) =>
      updateParams({ [PARAM.status]: parseOption(newStatus, STATUSES), [PARAM.page]: null }),
    [updateParams]
  );

  const handleClearFilters = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    lastSyncedSearchRef.current = "";
    setSearchTerm("");
    updateParams({
      [PARAM.search]: null,
      [PARAM.department]: null,
      [PARAM.role]: null,
      [PARAM.status]: null,
      [PARAM.page]: null,
    });
  }, [updateParams]);

  const handlePageChange = useCallback(
    (newPage: number) => updateParams({ [PARAM.page]: newPage }),
    [updateParams]
  );

  const handleTabChange = useCallback((tab: AdminUsersTab) => {
    setCurrentTab(tab);
  }, []);

  const hasActiveFilters =
    urlSearch.trim().length > 0 || department !== "" || role !== "" || status !== "";

  const usersQuery = useQuery({
    queryKey: ["admin", "users", "list", { page, search: urlSearch, department, role, status }],
    queryFn: () =>
      getUsersList({
        page,
        perPage: USERS_PER_PAGE,
        search: urlSearch,
        department,
        role,
        status,
      }),
    retry: false,
  });

  // Total geral do sistema, para o contador "Mostrando X de Y" quando há filtros
  const totalQuery = useQuery({
    queryKey: ["admin", "users", "total"],
    queryFn: () => getUsersList({ page: 1, perPage: 1 }),
    enabled: hasActiveFilters,
    retry: false,
  });

  const departmentsQuery = useQuery({
    queryKey: ["admin", "users", "departments"],
    queryFn: getUserDepartments,
    retry: false,
  });

  const profilesQuery = useQuery({
    queryKey: ["admin", "access-profiles", locale],
    queryFn: () => getAccessProfiles(locale),
    retry: false,
  });

  const users = usersQuery.data?.items ?? [];
  const filteredTotal = usersQuery.data?.total ?? 0;
  const totalUsers = hasActiveFilters ? (totalQuery.data?.total ?? filteredTotal) : filteredTotal;
  const totalPages = usersQuery.data?.totalPages ?? 1;

  const isLoading = usersQuery.isLoading;
  const isError = usersQuery.isError;
  const errorMessage = usersQuery.error ? t("error.message") : null;

  const handleRetry = useCallback(() => {
    void usersQuery.refetch();
  }, [usersQuery]);

  const handleRetryProfiles = useCallback(() => {
    void profilesQuery.refetch();
  }, [profilesQuery]);

  const availableDepartments = useMemo(() => {
    const list = departmentsQuery.data ?? [];
    // O setor da URL continua selecionável mesmo que a lista não o traga
    return department && !list.includes(department) ? [department, ...list] : list;
  }, [departmentsQuery.data, department]);

  const availableRoles: SelectOption[] = useMemo(
    () => [
      { value: "admin", label: t("roles.admin") },
      { value: "manager", label: t("roles.manager") },
      { value: "user", label: t("roles.user") },
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
    profilesErrorMessage: t("error.profilesMessage"),
    retryButton: t("error.retry"),
    inviteButton: t("inviteButton"),
    closeMessage: t("closeMessage"),
  };

  const accessProfiles = useMemo(
    () =>
      (profilesQuery.data ?? []).map((profile) => ({
        ...profile,
        description: profile.role ? t(`rolesTab.descriptions.${profile.role}`) : "",
      })),
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
    availableDepartments,
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
    isProfilesError: profilesQuery.isError,
    handleRetryProfiles,

    canInviteUsers,
    inviteSuccessMessage,
    handleDismissInviteMessage,
    deleteSuccessMessage,
    handleDismissDeleteMessage,

    labels,
  };
}
