import { getInitials } from "@/shared/utils/initials";
import { ApiRequestError } from "@services/httpClient";
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
  AdminUserDetails,
  UpdateUserPayload,
} from "@features/admin-user-detail/adminUserDetail.types";
import type {
  InviteUserPayload,
  InviteUserResponse,
} from "@features/admin-user-invite/adminUserInvite.types";

export { getInitials };
export type {
  AdminUserListItem,
  AccessProfile,
  UserRole,
  UserStatus,
  GetUsersListParams,
  PaginatedUsersResponse,
  UserCompletedJourney,
  AdminUserDetails,
  UpdateUserPayload,
  InviteUserPayload,
  InviteUserResponse,
};

const ROLE_LABEL_MAP: Record<UserRole, string> = {
  admin: "Administrador",
  manager: "Gestor",
  user: "Usuário",
};

export const MOCK_ACCESS_PROFILES: AccessProfile[] = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total à gestão de usuários, configurações e relatórios corporativos.",
    permissions: [
      "users.manage",
      "users.view",
      "users.register",
      "users.deactivate",
      "users.change_profile",
      "results.view_all",
      "results.view_own",
      "journeys.assign",
      "journeys.take",
      "catalog.manage",
    ],
  },
  {
    id: "manager",
    name: "Gestor",
    description: "Acompanhamento de equipes e atribuição de jornadas de capacitação.",
    permissions: [
      "users.view",
      "results.view_all",
      "journeys.assign",
      "journeys.take",
      "results.view_own",
    ],
  },
  {
    id: "user",
    name: "Usuário",
    description: "Perfil padrão atribuído a todos os colaboradores ao se cadastrarem.",
    isDefault: true,
    permissions: [
      "journeys.take",
      "results.view_own",
    ],
  },
];

let mockUsersData: AdminUserDetails[] = [
  {
    id: "1",
    name: "Ana Beatriz Silva",
    email: "ana.silva@empresa.com",
    initials: "AS",
    employeeCode: "EMP-1001",
    department: "Tecnologia da Informação",
    organization: "Secretaria de Governo Digital",
    role: "admin",
    roleLabel: "Administrador",
    status: "active",
    journeysCount: 4,
    createdAt: "2026-01-10T10:00:00Z",
    journeys: [
      {
        id: "j-1",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        domain: "privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-03-12T14:30:00Z",
        score: 90,
      },
      {
        id: "j-2",
        title: "Gestor de Segurança da Informação",
        domain: "security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-04-05T09:15:00Z",
        score: 85,
      },
      {
        id: "j-3",
        title: "Membro de Equipe de Resposta a Incidentes",
        domain: "security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-05-18T16:00:00Z",
        score: 78,
      },
      {
        id: "j-4",
        title: "Auditor de Conformidade e Segurança",
        domain: "joint",
        domainLabel: "Conjunta",
        completedAt: "2026-05-28T11:00:00Z",
        score: 92,
      },
    ],
  },
  {
    id: "2",
    name: "Carlos Eduardo Santos",
    email: "carlos.santos@empresa.com",
    initials: "CS",
    employeeCode: "EMP-1002",
    department: "Jurídico",
    organization: "Secretaria de Governo Digital",
    role: "manager",
    roleLabel: "Gestor",
    status: "active",
    journeysCount: 2,
    createdAt: "2026-02-15T11:20:00Z",
    journeys: [
      {
        id: "j-1",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        domain: "privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-04-20T10:00:00Z",
        score: 95,
      },
      {
        id: "j-5",
        title: "Controlador",
        domain: "privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-05-10T15:45:00Z",
        score: 88,
      },
    ],
  },
  {
    id: "3",
    name: "Mariana Oliveira",
    email: "mariana.oliveira@empresa.com",
    initials: "MO",
    employeeCode: "EMP-1003",
    department: "Recursos Humanos",
    organization: "Secretaria de Governo Digital",
    role: "user",
    roleLabel: "Usuário",
    status: "active",
    journeysCount: 1,
    createdAt: "2026-03-01T08:00:00Z",
    journeys: [
      {
        id: "j-1",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        domain: "privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-05-02T16:20:00Z",
        score: 72,
      },
    ],
  },
  {
    id: "4",
    name: "Ricardo Mendes",
    email: "ricardo.mendes@empresa.com",
    initials: "RM",
    employeeCode: "EMP-1004",
    department: "Segurança da Informação",
    organization: "Secretaria de Governo Digital",
    role: "user",
    roleLabel: "Usuário",
    status: "inactive",
    journeysCount: 0,
    createdAt: "2026-03-15T13:40:00Z",
    journeys: [],
  },
  {
    id: "5",
    name: "Juliana Ferreira",
    email: "juliana.ferreira@empresa.com",
    initials: "JF",
    employeeCode: "EMP-1005",
    department: "Compliance",
    organization: "Secretaria de Governo Digital",
    role: "manager",
    roleLabel: "Gestor",
    status: "pending",
    journeysCount: 0,
    createdAt: "2026-04-01T15:00:00Z",
    journeys: [],
  },
  {
    id: "6",
    name: "Lucas Pereira",
    email: "lucas.pereira@empresa.com",
    initials: "LP",
    employeeCode: "EMP-1006",
    department: "Tecnologia da Informação",
    organization: "Secretaria de Governo Digital",
    role: "user",
    roleLabel: "Usuário",
    status: "active",
    journeysCount: 3,
    createdAt: "2026-04-10T09:30:00Z",
    journeys: [
      {
        id: "j-2",
        title: "Gestor de Segurança da Informação",
        domain: "security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-04-25T11:00:00Z",
        score: 82,
      },
      {
        id: "j-3",
        title: "Membro de Equipe de Resposta a Incidentes",
        domain: "security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-05-12T14:10:00Z",
        score: 79,
      },
      {
        id: "j-4",
        title: "Auditor de Conformidade e Segurança",
        domain: "joint",
        domainLabel: "Conjunta",
        completedAt: "2026-05-29T17:30:00Z",
        score: 84,
      },
    ],
  },
  {
    id: "7",
    name: "Fernanda Costa",
    email: "fernanda.costa@empresa.com",
    initials: "FC",
    employeeCode: "EMP-1007",
    department: "Operações",
    organization: "Secretaria de Governo Digital",
    role: "user",
    roleLabel: "Usuário",
    status: "active",
    journeysCount: 1,
    createdAt: "2026-04-15T14:20:00Z",
    journeys: [
      {
        id: "j-1",
        title: "Encarregado pelo Tratamento de Dados Pessoais",
        domain: "privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-05-18T10:30:00Z",
        score: 88,
      },
    ],
  },
  {
    id: "8",
    name: "Gabriel Martins",
    email: "gabriel.martins@empresa.com",
    initials: "GM",
    employeeCode: "EMP-1008",
    department: "Financeiro",
    organization: "Secretaria de Governo Digital",
    role: "user",
    roleLabel: "Usuário",
    status: "inactive",
    journeysCount: 0,
    createdAt: "2026-04-20T16:00:00Z",
    journeys: [],
  },
];

export async function getUsersList(
  params: GetUsersListParams = {}
): Promise<PaginatedUsersResponse> {
  const {
    search = "",
    department = "",
    role = "",
    status = "",
    page = 1,
    limit = params.per_page ?? 6,
  } = params;

  let filtered = [...mockUsersData];

  if (search.trim()) {
    const query = search.trim().toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.employeeCode.toLowerCase().includes(query)
    );
  }

  if (department) {
    filtered = filtered.filter((u) => u.department === department);
  }

  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }

  if (status) {
    filtered = filtered.filter((u) => u.status === status);
  }

  const startIndex = (page - 1) * limit;
  const paginatedItems = filtered.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil(filtered.length / limit) || 1;

  return {
    items: paginatedItems,
    total: mockUsersData.length,
    filteredTotal: filtered.length,
    page,
    limit,
    totalPages,
  };
}

export async function getUserById(id: string): Promise<AdminUserDetails> {
  const found = mockUsersData.find((u) => u.id === id);
  if (found) return found;
  if (mockUsersData.length > 0) return mockUsersData[0];
  throw new Error("Usuário não encontrado");
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<AdminUserDetails> {
  const index = mockUsersData.findIndex((u) => u.id === id);
  if (index !== -1) {
    mockUsersData[index] = {
      ...mockUsersData[index],
      ...payload,
      initials: getInitials(payload.name),
      roleLabel: ROLE_LABEL_MAP[payload.role] || "Usuário",
    };
    return mockUsersData[index];
  }
  throw new Error("Usuário não encontrado");
}

/**
 * Simula `POST /admin/user-invitations` enquanto o endpoint do backend
 * não é integrado neste ambiente. Retorna 409 (`ACCOUNT_ALREADY_EXISTS`)
 * para e-mails já cadastrados e 201 com o registro pendente criado no mock.
 */
export async function inviteUser(
  payload: InviteUserPayload
): Promise<InviteUserResponse> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const alreadyExists = mockUsersData.some(
    (u) => u.email.toLowerCase() === normalizedEmail
  );

  if (alreadyExists) {
    throw new ApiRequestError(
      "Já existe uma conta cadastrada com este e-mail.",
      409,
      "ACCOUNT_ALREADY_EXISTS"
    );
  }

  const nextNumericId =
    mockUsersData.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;
  const nextId = String(nextNumericId);
  const localPart = normalizedEmail.split("@")[0] || "Novo Usuario";
  const displayName = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const roleLabel = ROLE_LABEL_MAP[payload.role] || "Usuário";

  const createdUser: AdminUserDetails = {
    id: nextId,
    name: displayName || normalizedEmail,
    email: normalizedEmail,
    initials: getInitials(displayName || normalizedEmail),
    employeeCode: `EMP-${1000 + mockUsersData.length + 1}`,
    department: "Tecnologia da Informação",
    organization: "Secretaria de Governo Digital",
    role: payload.role,
    roleLabel,
    status: "pending",
    journeysCount: 0,
    createdAt: new Date().toISOString(),
    journeys: [],
  };

  mockUsersData = [createdUser, ...mockUsersData];

  return {
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
    roleLabel: createdUser.roleLabel,
    status: createdUser.status,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

export async function toggleUserStatus(
  id: string,
  newStatus: UserStatus
): Promise<AdminUserDetails> {
  const index = mockUsersData.findIndex((u) => u.id === id);
  if (index !== -1) {
    mockUsersData[index] = {
      ...mockUsersData[index],
      status: newStatus,
    };
    return mockUsersData[index];
  }
  throw new Error("Usuário não encontrado");
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  mockUsersData = mockUsersData.filter((u) => u.id !== id);
  return { success: true };
}

export async function getAccessProfiles(): Promise<AccessProfile[]> {
  return MOCK_ACCESS_PROFILES;
}
