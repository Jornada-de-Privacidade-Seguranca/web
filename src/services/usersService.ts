import { apiRequest } from "@services/httpClient";
import { env } from "@/shared/config/env";

export type UserStatus = "active" | "pending" | "inactive";
export type UserRole = "admin" | "manager" | "user";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  employeeCode: string;
  department: string;
  role: UserRole;
  roleLabel: string;
  status: UserStatus;
  journeysCount: number;
  organization: string;
  createdAt: string;
}

export interface AccessProfile {
  id: UserRole;
  name: string;
  description: string;
  isDefault?: boolean;
  permissions: string[];
}

export interface UserCompletedJourney {
  id: string;
  title: string;
  domain: "privacy" | "security" | "joint";
  domainLabel: string;
  completedAt: string;
  score: number;
}

export interface AdminUserDetails extends AdminUserListItem {
  journeys: UserCompletedJourney[];
}

export interface GetUsersListParams {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  items: AdminUserListItem[];
  total: number;
  filteredTotal: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserPayload {
  name: string;
  organization: string;
  employeeCode: string;
  email: string;
  department: string;
  role: UserRole;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const MOCK_ACCESS_PROFILES: AccessProfile[] = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total à gestão de usuários, configurações e relatórios corporativos.",
    permissions: [
      "Visualizar e gerenciar todos os usuários",
      "Alterar perfis de acesso e permissões",
      "Ativar, desativar e excluir contas",
      "Visualizar relatórios gerais e individuais de jornadas",
      "Configurar parâmetros do sistema",
    ],
  },
  {
    id: "manager",
    name: "Gestor",
    description: "Acompanhamento de equipes e atribuição de jornadas de capacitação.",
    permissions: [
      "Visualizar usuários do seu setor",
      "Acompanhar resultados e progresso de jornadas da equipe",
      "Atribuir trilhas de capacitação",
      "Exportar relatórios setoriais",
    ],
  },
  {
    id: "user",
    name: "Usuário",
    description: "Perfil padrão atribuído a todos os colaboradores ao se cadastrarem.",
    isDefault: true,
    permissions: [
      "Acessar e responder jornadas disponíveis",
      "Visualizar histórico e notas de resultados pessoais",
      "Editar dados cadastrais próprios no perfil",
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
        title: "Fundamentos de LGPD",
        domain: "privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-03-12T14:30:00Z",
        score: 90,
      },
      {
        id: "j-2",
        title: "Segurança de Senhas e Acessos",
        domain: "security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-04-05T09:15:00Z",
        score: 85,
      },
      {
        id: "j-3",
        title: "Prevenção contra Phishing",
        domain: "security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-05-18T16:00:00Z",
        score: 78,
      },
      {
        id: "j-4",
        title: "Governança de Dados Corporativos",
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
        title: "Fundamentos de LGPD",
        domain: "privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-04-20T10:00:00Z",
        score: 95,
      },
      {
        id: "j-5",
        title: "Gestão de Incidentes de Privacidade",
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
        title: "Fundamentos de LGPD",
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
        title: "Segurança de Senhas e Acessos",
        domain: "security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-04-25T11:00:00Z",
        score: 82,
      },
      {
        id: "j-3",
        title: "Prevenção contra Phishing",
        domain: "security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-05-12T14:10:00Z",
        score: 79,
      },
      {
        id: "j-4",
        title: "Governança de Dados Corporativos",
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
        title: "Fundamentos de LGPD",
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
    limit = 6,
  } = params;

  try {
    return await apiRequest<PaginatedUsersResponse>(
      "/admin/users",
      {
        params: {
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(department ? { department } : {}),
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
          page,
          limit,
        },
      },
      "Erro ao carregar a listagem de usuários."
    );
  } catch (err: unknown) {
    if (env.isDev || process.env.NODE_ENV === "test") {
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
    throw err;
  }
}

export async function getUserById(id: string): Promise<AdminUserDetails> {
  try {
    return await apiRequest<AdminUserDetails>(
      `/admin/users/${id}`,
      {},
      "Erro ao carregar os dados do usuário."
    );
  } catch (err: unknown) {
    if (env.isDev || process.env.NODE_ENV === "test") {
      const found = mockUsersData.find((u) => u.id === id);
      if (found) return found;
      // Fallback para novo id ou primeiro usuário
      return mockUsersData[0];
    }
    throw err;
  }
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<AdminUserDetails> {
  try {
    return await apiRequest<AdminUserDetails>(
      `/admin/users/${id}`,
      { method: "put", data: payload, withCsrf: true },
      "Erro ao atualizar o usuário."
    );
  } catch (err: unknown) {
    if (env.isDev || process.env.NODE_ENV === "test") {
      const roleLabelMap: Record<UserRole, string> = {
        admin: "Administrador",
        manager: "Gestor",
        user: "Usuário",
      };

      const index = mockUsersData.findIndex((u) => u.id === id);
      if (index !== -1) {
        mockUsersData[index] = {
          ...mockUsersData[index],
          ...payload,
          initials: getInitials(payload.name),
          roleLabel: roleLabelMap[payload.role] || "Usuário",
        };
        return mockUsersData[index];
      }
      throw new Error("Usuário não encontrado");
    }
    throw err;
  }
}

export async function toggleUserStatus(
  id: string,
  newStatus: UserStatus
): Promise<AdminUserDetails> {
  try {
    return await apiRequest<AdminUserDetails>(
      `/admin/users/${id}/status`,
      { method: "patch", data: { status: newStatus }, withCsrf: true },
      "Erro ao alterar o status do usuário."
    );
  } catch (err: unknown) {
    if (env.isDev || process.env.NODE_ENV === "test") {
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
    throw err;
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  try {
    return await apiRequest<{ success: boolean }>(
      `/admin/users/${id}`,
      { method: "delete", withCsrf: true },
      "Erro ao excluir o usuário."
    );
  } catch (err: unknown) {
    if (env.isDev || process.env.NODE_ENV === "test") {
      mockUsersData = mockUsersData.filter((u) => u.id !== id);
      return { success: true };
    }
    throw err;
  }
}

export async function getAccessProfiles(): Promise<AccessProfile[]> {
  try {
    return await apiRequest<AccessProfile[]>(
      "/admin/roles",
      {},
      "Erro ao carregar os perfis de acesso."
    );
  } catch (err: unknown) {
    if (env.isDev || process.env.NODE_ENV === "test") {
      return MOCK_ACCESS_PROFILES;
    }
    throw err;
  }
}
