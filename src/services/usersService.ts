import { getInitials } from "@/shared/utils/initials";
import { apiRequest, apiRequestWithMeta } from "@services/httpClient";
import {
  mapKnowledgeDomain,
  type JourneyKnowledgeDomainApi,
} from "@services/journeyService";
import type {
  AdminUserListItem,
  AccessProfile,
  UserRole,
  UserStatus,
  GetUsersListParams,
  PaginatedUsersResponse,
  UserCompletedJourney,
} from "@features/admin-users/adminUsers.types";
import type {
  ActiveJourney,
  AdminUserDetails,
  AssignableJourneyProfile,
  AssignJourneyPayload,
  JourneyAssignedBy,
  JourneyDomain,
  JourneyOrigin,
  UpdateUserPayload,
} from "@features/admin-user-detail/adminUserDetail.types";

/** `data` de POST /admin/user-invitations (InvitedUserResource). */
export interface UserInvitationApiData {
  id: number;
  email: string;
  user_type_id: number | null;
  profile_type_id: number;
  active_status: number;
  account_status: "pending_initial_password" | "active";
}

export interface InviteUserPayload {
  email: string;
  /** Id do perfil de acesso em TB_TIPO_PERFIL, vindo de GET /access-profiles. */
  profileTypeId: number;
}

export interface InviteUserResponse {
  id: string;
  email: string;
  profileTypeId: number;
  status: UserStatus;
}

export { getInitials };
export type {
  ActiveJourney,
  AdminUserListItem,
  AccessProfile,
  UserRole,
  UserStatus,
  GetUsersListParams,
  PaginatedUsersResponse,
  UserCompletedJourney,
  AdminUserDetails,
  AssignableJourneyProfile,
  AssignJourneyPayload,
  JourneyAssignedBy,
  JourneyOrigin,
  UpdateUserPayload,
};

type Locale = "pt" | "en";

/** Item de GET /users e base do GET /users/{user}. */
export interface UserManagementApiItem {
  id: number;
  name: string | null;
  email: string | null;
  organization: string | null;
  department: string | null;
  registration_number: string | null;
  access_profile: { id: number; name: string } | null;
  status: "active" | "pending_activation" | "inactive";
  active_status: number;
  completed_journeys_count?: number;
  created_at: string | null;
}

export interface UserManagementDetailApi extends UserManagementApiItem {
  journey_profile_id: number | null;
}

interface PaginationMetaApi {
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_next_page: boolean;
  };
}

export interface AccessProfileApiItem {
  id: number;
  name: string;
  permissions: {
    id: number;
    code: string;
    description_pt: string | null;
    description_en: string | null;
  }[];
}

/** Item de GET /users/{user}/journeys usado no detalhe do usuário. */
export interface UserJourneyApiItem {
  id: number;
  journey_profile: {
    id: number | null;
    name_pt: string | null;
    name_en: string | null;
    knowledge_domain: JourneyKnowledgeDomainApi | null;
  };
  started_at: string | null;
  finished_at: string | null;
  origin: JourneyOrigin | null;
  assigned_by: { id: number; name: string | null } | null;
  status: "completed" | "ongoing" | "cancelled";
  score: number | null;
}

/** Perfis de acesso conhecidos pelo front, pelo id de TB_TIPO_PERFIL. */
const ROLE_BY_PROFILE_ID: Record<number, UserRole> = {
  1: "admin",
  2: "manager",
  3: "user",
};

export const PROFILE_ID_BY_ROLE: Record<UserRole, number> = {
  admin: 1,
  manager: 2,
  user: 3,
};

const STATUS_FROM_API: Record<UserManagementApiItem["status"], UserStatus> = {
  active: "active",
  pending_activation: "pending",
  inactive: "inactive",
};

const STATUS_TO_API: Record<UserStatus, UserManagementApiItem["status"]> = {
  active: "active",
  pending: "pending_activation",
  inactive: "inactive",
};

/** Campo do formulário => campo do PATCH /users/{user}. */
const API_FIELD_BY_FORM_FIELD: Record<keyof UpdateUserPayload, string> = {
  name: "name",
  email: "email",
  organization: "organization",
  department: "department",
  employeeCode: "registration_number",
};

/** Campo do envelope de erro => campo do formulário. */
export const FORM_FIELD_BY_API_FIELD: Record<string, keyof UpdateUserPayload> = {
  name: "name",
  email: "email",
  organization: "organization",
  department: "department",
  registration_number: "employeeCode",
};

export function roleFromProfileId(profileId: number | null | undefined): UserRole | null {
  if (profileId == null) return null;
  return ROLE_BY_PROFILE_ID[profileId] ?? null;
}

export function mapUserListItem(item: UserManagementApiItem): AdminUserListItem {
  const name = item.name?.trim() ?? "";
  const email = item.email ?? "";
  const profileTypeId = item.access_profile?.id ?? null;

  return {
    id: String(item.id),
    name,
    email,
    initials: getInitials(name || email),
    employeeCode: item.registration_number ?? "",
    department: item.department ?? "",
    organization: item.organization ?? "",
    role: roleFromProfileId(profileTypeId) ?? "user",
    profileTypeId,
    roleLabel: item.access_profile?.name ?? "—",
    status: STATUS_FROM_API[item.status] ?? "inactive",
    journeysCount: item.completed_journeys_count ?? 0,
    createdAt: item.created_at ?? "",
  };
}

function localizedName(
  source: { name_pt: string | null; name_en: string | null } | null | undefined,
  locale: Locale
): string {
  if (!source) return "";
  const preferred = locale === "en" ? source.name_en : source.name_pt;
  return preferred || source.name_pt || source.name_en || "";
}

function mapCompletedJourney(item: UserJourneyApiItem, locale: Locale): UserCompletedJourney {
  return {
    id: String(item.id),
    title: localizedName(item.journey_profile, locale),
    domain: mapKnowledgeDomain(item.journey_profile.knowledge_domain) ?? "joint",
    domainLabel: localizedName(item.journey_profile.knowledge_domain, locale),
    completedAt: item.finished_at ?? "",
    score: item.score ?? 0,
  };
}

function mapActiveJourney(item: UserJourneyApiItem, locale: Locale): ActiveJourney {
  const assignedBy: JourneyAssignedBy | null = item.assigned_by
    ? { id: item.assigned_by.id, name: item.assigned_by.name ?? "" }
    : null;

  return {
    id: String(item.id),
    profileId: item.journey_profile.id ?? 0,
    title: localizedName(item.journey_profile, locale),
    domain: mapKnowledgeDomain(item.journey_profile.knowledge_domain) ?? "joint",
    domainLabel: localizedName(item.journey_profile.knowledge_domain, locale),
    startedAt: item.started_at ?? "",
    origin: item.origin ?? "self_started",
    assignedBy,
    assigned_by: assignedBy,
  };
}

/** GET /users: busca, filtros e paginação são aplicados pela API. */
export async function getUsersList(
  params: GetUsersListParams = {}
): Promise<PaginatedUsersResponse> {
  const { search = "", department = "", role = "", status = "", page = 1, perPage = 10 } =
    params;

  const query: Record<string, string | number> = { page, per_page: perPage };
  if (search.trim()) query.search = search.trim();
  if (department) query.department = department;
  if (role) query.profile_type_id = PROFILE_ID_BY_ROLE[role];
  if (status) query.status = STATUS_TO_API[status];

  const { data, meta } = await apiRequestWithMeta<UserManagementApiItem[], PaginationMetaApi>(
    "/users",
    { params: query },
    "Erro ao carregar a listagem de usuários."
  );

  const items = Array.isArray(data) ? data.map(mapUserListItem) : [];
  const pagination = meta?.pagination;

  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.current_page ?? page,
    perPage: pagination?.per_page ?? perPage,
    totalPages: Math.max(pagination?.last_page ?? 1, 1),
  };
}

/** GET /users/departments: setores cadastrados, para o filtro da listagem. */
export async function getUserDepartments(): Promise<string[]> {
  const data = await apiRequest<string[]>(
    "/users/departments",
    {},
    "Erro ao carregar os setores."
  );
  return Array.isArray(data) ? data.filter((item) => typeof item === "string" && item) : [];
}

async function getUserJourneys(
  userId: string,
  status: UserJourneyApiItem["status"],
  perPage: number
): Promise<UserJourneyApiItem[]> {
  const data = await apiRequest<UserJourneyApiItem[]>(
    `/users/${userId}/journeys`,
    { params: { status, page: 1, per_page: perPage } },
    "Erro ao carregar as jornadas do usuário."
  );
  return Array.isArray(data) ? data : [];
}

/**
 * Detalhe do usuário: GET /users/{user} com as jornadas finalizadas e a em
 * andamento de GET /users/{user}/journeys. Um usuário inexistente rejeita com
 * `ApiRequestError` de status 404.
 */
export async function getUserById(id: string, locale: Locale = "pt"): Promise<AdminUserDetails> {
  const [user, completed, ongoing] = await Promise.all([
    apiRequest<UserManagementDetailApi>(`/users/${id}`, {}, "Erro ao carregar o usuário."),
    getUserJourneys(id, "completed", 100),
    getUserJourneys(id, "ongoing", 1),
  ]);

  return {
    ...mapUserListItem(user),
    initialJourneyProfileId: user.journey_profile_id,
    journeys: completed.map((item) => mapCompletedJourney(item, locale)),
    activeJourney: ongoing[0] ? mapActiveJourney(ongoing[0], locale) : null,
  };
}

/** PATCH /users/{user} só com os campos alterados. */
export async function updateUser(id: string, changes: UpdateUserPayload): Promise<void> {
  const body: Record<string, string> = {};
  (Object.keys(changes) as (keyof UpdateUserPayload)[]).forEach((field) => {
    const value = changes[field];
    if (value !== undefined) body[API_FIELD_BY_FORM_FIELD[field]] = value.trim();
  });

  await apiRequest<UserManagementDetailApi>(
    `/users/${id}`,
    { method: "PATCH", data: body, withCsrf: true },
    "Erro ao atualizar o usuário."
  );
}

/** PUT /users/{user}/access-profile. */
export async function changeUserAccessProfile(id: string, role: UserRole): Promise<void> {
  await apiRequest<UserManagementDetailApi>(
    `/users/${id}/access-profile`,
    { method: "PUT", data: { profile_type_id: PROFILE_ID_BY_ROLE[role] }, withCsrf: true },
    "Erro ao alterar o perfil de acesso."
  );
}

/**
 * POST /admin/users/{user}/activate ou /deactivate (#120). Ativar vale para
 * contas pendentes e inativas; desativar, para contas ativas.
 */
export async function toggleUserStatus(id: string, newStatus: UserStatus): Promise<void> {
  const action = newStatus === "active" ? "activate" : "deactivate";
  await apiRequest(
    `/admin/users/${id}/${action}`,
    { method: "POST", withCsrf: true },
    "Erro ao alterar a situação do usuário."
  );
}

/** DELETE /users/{user} (exclusão lógica). */
export async function deleteUser(id: string): Promise<void> {
  await apiRequest<null>(
    `/users/${id}`,
    { method: "DELETE", withCsrf: true },
    "Erro ao excluir o usuário."
  );
}

/** GET /access-profiles, com a descrição das permissões no idioma informado. */
export async function getAccessProfiles(locale: Locale = "pt"): Promise<AccessProfile[]> {
  const data = await apiRequest<AccessProfileApiItem[]>(
    "/access-profiles",
    {},
    "Erro ao carregar os perfis de acesso."
  );

  return (Array.isArray(data) ? data : []).map((profile) => {
    const role = roleFromProfileId(profile.id);
    return {
      id: profile.id,
      role,
      name: profile.name,
      description: "",
      isDefault: role === "user",
      permissions: (profile.permissions ?? []).map((permission) => {
        const description =
          locale === "en" ? permission.description_en : permission.description_pt;
        return description || permission.description_pt || permission.code;
      }),
    };
  });
}

/**
 * POST /admin/user-invitations: cria a conta pendente e envia o e-mail com o
 * link de definir a senha. Erros chegam como ApiRequestError: 409
 * `ACCOUNT_ALREADY_EXISTS`, 403 `PERMISSION_DENIED`, 422 por campo e 429.
 */
export async function inviteUser(payload: InviteUserPayload): Promise<InviteUserResponse> {
  const data = await apiRequest<UserInvitationApiData>(
    "/admin/user-invitations",
    {
      method: "POST",
      data: { email: payload.email.trim().toLowerCase(), profile_type_id: payload.profileTypeId },
      withCsrf: true,
    },
    "Não foi possível enviar o convite."
  );

  return {
    id: String(data.id),
    email: data.email,
    profileTypeId: data.profile_type_id,
    status: data.account_status === "active" ? "active" : "pending",
  };
}

// ---------------------------------------------------------------------------
// Mocks que continuam até a integração própria: atribuição/cancelamento de
// jornada (#170).
// ---------------------------------------------------------------------------

export interface JourneyProfileApiItem {
  id: number;
  name_pt: string;
  name_en: string;
  knowledge_domain: JourneyDomain;
}

export const MOCK_ASSIGNABLE_PROFILES: JourneyProfileApiItem[] = [
  {
    id: 1,
    name_pt: "Encarregado pelo Tratamento de Dados Pessoais",
    name_en: "Data Protection Officer (DPO)",
    knowledge_domain: "privacy",
  },
  {
    id: 2,
    name_pt: "Gestor de Segurança da Informação",
    name_en: "Information Security Manager",
    knowledge_domain: "security",
  },
  {
    id: 3,
    name_pt: "Controlador",
    name_en: "Data Controller",
    knowledge_domain: "privacy",
  },
  {
    id: 4,
    name_pt: "Operador",
    name_en: "Data Operator",
    knowledge_domain: "privacy",
  },
  {
    id: 5,
    name_pt: "Auditor de Segurança e Privacidade",
    name_en: "Security and Privacy Auditor",
    knowledge_domain: "joint",
  },
];

const DOMAIN_LABELS: Record<JourneyDomain, string> = {
  privacy: "Privacidade",
  security: "Segurança da Informação",
  joint: "Conjunta",
};

export async function getAssignableJourneyProfiles(): Promise<
  AssignableJourneyProfile[]
> {
  return MOCK_ASSIGNABLE_PROFILES.map((profile) => ({
    id: profile.id,
    namePt: profile.name_pt,
    nameEn: profile.name_en,
    domain: profile.knowledge_domain,
  }));
}

/** Mock da atribuição de jornada (#170): devolve o usuário com a jornada em andamento. */
export async function assignJourneyToUser(
  user: AdminUserDetails,
  payload: AssignJourneyPayload
): Promise<AdminUserDetails> {
  const profile = MOCK_ASSIGNABLE_PROFILES.find((p) => p.id === payload.profileId);
  if (!profile) {
    throw new Error("Perfil de jornada não encontrado");
  }

  const assignedBy: JourneyAssignedBy = payload.assignedBy ?? {
    id: 1,
    name: "Administrador",
  };

  const activeJourney: ActiveJourney = {
    id: `aj-${user.id}-${Date.now()}`,
    profileId: profile.id,
    title: profile.name_pt,
    domain: profile.knowledge_domain,
    domainLabel: DOMAIN_LABELS[profile.knowledge_domain],
    startedAt: new Date().toISOString(),
    origin: "assigned",
    assignedBy,
    assigned_by: assignedBy,
  };

  return { ...user, activeJourney };
}

/** Mock do cancelamento da atribuição (#170): devolve o usuário sem jornada em andamento. */
export async function cancelAssignedJourney(
  user: AdminUserDetails
): Promise<AdminUserDetails> {
  return { ...user, activeJourney: null };
}
