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
  ActiveJourney,
  AdminUserDetails,
  AssignableJourneyProfile,
  AssignJourneyPayload,
  JourneyAssignedBy,
  JourneyDomain,
  JourneyOrigin,
  UpdateUserPayload,
} from "@features/admin-user-detail/adminUserDetail.types";

export interface UserInvitationApiData {
  id: number;
  email: string;
  user_type_id: number;
  profile_type_id: number;
  active_status: number;
  account_status: "pending_initial_password";
}

export interface UserInvitationApiResponse {
  message: string;
  data: UserInvitationApiData;
}

export interface InviteUserPayload {
  email: string;
  role: UserRole;
}

export interface InviteUserResponse {
  id: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  status: UserStatus;
  expiresAt: string;
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

const ROLE_LABEL_MAP: Record<UserRole, string> = {
  admin: "Administrador",
  manager: "Gestor",
  user: "Usuário",
};

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
    description:
      "Vê tudo o que o administrador vê e pode atribuir jornadas, mas não altera usuários nem perfis.",
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
    initialJourneyProfileId: 1,
    activeJourney: {
      id: "aj-1",
      profileId: 3,
      title: "Controlador",
      domain: "privacy",
      domainLabel: "Privacidade",
      startedAt: "2026-06-03T09:15:00Z",
      origin: "self_started",
      assignedBy: null,
      assigned_by: null,
    },
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
    initialJourneyProfileId: 1,
    activeJourney: {
      id: "aj-2",
      profileId: 2,
      title: "Gestor de Segurança da Informação",
      domain: "security",
      domainLabel: "Segurança da Informação",
      startedAt: "2026-06-01T10:00:00Z",
      origin: "assigned",
      assignedBy: { id: 1, name: "Usuário Teste" },
      assigned_by: { id: 1, name: "Usuário Teste" },
    },
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
    initialJourneyProfileId: 1,
    activeJourney: {
      id: "aj-3",
      profileId: 4,
      title: "Operador",
      domain: "privacy",
      domainLabel: "Privacidade",
      startedAt: "2026-06-02T14:30:00Z",
      origin: "assigned",
      assignedBy: { id: 99, name: "Roberto Almeida" },
      assigned_by: { id: 99, name: "Roberto Almeida" },
    },
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
    initialJourneyProfileId: 1,
    activeJourney: null,
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
    initialJourneyProfileId: 2,
    activeJourney: null,
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
    initialJourneyProfileId: 1,
    activeJourney: null,
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

const ROLE_TO_PROFILE_ID: Record<UserRole, number> = {
  admin: 1,
  manager: 2,
  user: 3,
};

/**
 * Simula `POST /admin/user-invitations` seguindo a especificação do PR 78 (#122).
 * Retorna 409 (`ACCOUNT_ALREADY_EXISTS`) para e-mails já cadastrados
 * e 201 com os dados do convite gerado e usuário com status pendente.
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
  const roleLabel = ROLE_LABEL_MAP[payload.role] || "Usuário";
  const profileTypeId = ROLE_TO_PROFILE_ID[payload.role] ?? 3;

  // Mock seguindo contrato do PR 78 do backend
  const apiMockResponse: UserInvitationApiResponse = {
    message: "Convite enviado com sucesso",
    data: {
      id: nextNumericId,
      email: normalizedEmail,
      user_type_id: 2,
      profile_type_id: profileTypeId,
      active_status: 2,
      account_status: "pending_initial_password",
    },
  };

  // Usuário convidado não possui dados cadastrais (nome, matrícula, setor) até aceitar o convite
  const createdUser: AdminUserDetails = {
    id: nextId,
    name: "",
    email: normalizedEmail,
    initials: "",
    employeeCode: "",
    department: "",
    organization: "",
    role: payload.role,
    roleLabel,
    status: "pending",
    journeysCount: 0,
    createdAt: new Date().toISOString(),
    journeys: [],
  };

  mockUsersData = [createdUser, ...mockUsersData];

  return {
    id: String(apiMockResponse.data.id),
    email: apiMockResponse.data.email,
    role: payload.role,
    roleLabel,
    status: "pending",
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

export async function assignJourneyToUser(
  userId: string,
  payload: AssignJourneyPayload
): Promise<AdminUserDetails> {
  const index = mockUsersData.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error("Usuário não encontrado");
  }

  const profile = MOCK_ASSIGNABLE_PROFILES.find((p) => p.id === payload.profileId);
  if (!profile) {
    throw new Error("Perfil de jornada não encontrado");
  }

  const assignedBy: JourneyAssignedBy = payload.assignedBy ?? {
    id: 1,
    name: "Administrador",
  };

  const activeJourney: ActiveJourney = {
    id: `aj-${userId}-${Date.now()}`,
    profileId: profile.id,
    title: profile.name_pt,
    domain: profile.knowledge_domain,
    domainLabel: DOMAIN_LABELS[profile.knowledge_domain],
    startedAt: new Date().toISOString(),
    origin: "assigned",
    assignedBy,
    assigned_by: assignedBy,
  };

  mockUsersData[index] = {
    ...mockUsersData[index],
    activeJourney,
  };

  return { ...mockUsersData[index] };
}

export async function cancelAssignedJourney(
  userId: string
): Promise<AdminUserDetails> {
  const index = mockUsersData.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error("Usuário não encontrado");
  }

  mockUsersData[index] = {
    ...mockUsersData[index],
    activeJourney: null,
  };

  return { ...mockUsersData[index] };
}
