import { getInitials } from "@shared/utils/initials";
import { normalizeScore, resolveScoreBand } from "@shared/utils/scoreBand";
import { computeDomainAverages } from "@features/admin-results/adminResults.utils";
import type {
  AdminResultDomainOption,
  AdminResultItem,
  AdminResultProfileOption,
  AdminResultsFilterOptions,
  AdminResultsResponse,
  AdminResultUserOption,
  GetAdminResultsParams,
  JourneyDomain,
} from "@features/admin-results/adminResults.types";

interface RawMockAdminResult {
  id: string;
  journeyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  profileId: string;
  profileNamePt: string;
  profileNameEn: string;
  domain: JourneyDomain;
  domainNamePt: string;
  domainNameEn: string;
  completedAt: string;
  score: number;
}

const RAW_MOCK_RESULTS: RawMockAdminResult[] = [
  {
    id: "ar-1",
    journeyId: "101",
    userId: "1",
    userName: "Ana Beatriz Silva",
    userEmail: "ana.silva@empresa.com",
    department: "Tecnologia da Informação",
    profileId: "6",
    profileNamePt: "Auditor de Conformidade e Segurança",
    profileNameEn: "Compliance and Security Auditor",
    domain: "joint",
    domainNamePt: "Conjunta",
    domainNameEn: "Joint",
    completedAt: "2026-06-08T14:20:00Z",
    score: 92,
  },
  {
    id: "ar-2",
    journeyId: "102",
    userId: "6",
    userName: "Lucas Pereira",
    userEmail: "lucas.pereira@empresa.com",
    department: "Tecnologia da Informação",
    profileId: "6",
    profileNamePt: "Auditor de Conformidade e Segurança",
    profileNameEn: "Compliance and Security Auditor",
    domain: "joint",
    domainNamePt: "Conjunta",
    domainNameEn: "Joint",
    completedAt: "2026-06-05T17:30:00Z",
    score: 84,
  },
  {
    id: "ar-3",
    journeyId: "103",
    userId: "9",
    userName: "Bruno Almeida",
    userEmail: "bruno.almeida@empresa.com",
    department: "Compliance",
    profileId: "4",
    profileNamePt: "Gestor de Segurança da Informação",
    profileNameEn: "Information Security Manager",
    domain: "security",
    domainNamePt: "Segurança da Informação",
    domainNameEn: "Information Security",
    completedAt: "2026-06-02T11:45:00Z",
    score: 91,
  },
  {
    id: "ar-4",
    journeyId: "104",
    userId: "7",
    userName: "Fernanda Costa",
    userEmail: "fernanda.costa@empresa.com",
    department: "Operações",
    profileId: "6",
    profileNamePt: "Auditor de Conformidade e Segurança",
    profileNameEn: "Compliance and Security Auditor",
    domain: "joint",
    domainNamePt: "Conjunta",
    domainNameEn: "Joint",
    completedAt: "2026-05-29T15:10:00Z",
    score: 54,
  },
  {
    id: "ar-5",
    journeyId: "105",
    userId: "1",
    userName: "Ana Beatriz Silva",
    userEmail: "ana.silva@empresa.com",
    department: "Tecnologia da Informação",
    profileId: "5",
    profileNamePt: "Membro de Equipe de Resposta a Incidentes",
    profileNameEn: "Incident Response Team Member",
    domain: "security",
    domainNamePt: "Segurança da Informação",
    domainNameEn: "Information Security",
    completedAt: "2026-05-25T16:00:00Z",
    score: 78,
  },
  {
    id: "ar-6",
    journeyId: "106",
    userId: "7",
    userName: "Fernanda Costa",
    userEmail: "fernanda.costa@empresa.com",
    department: "Operações",
    profileId: "1",
    profileNamePt: "Encarregado pelo Tratamento de Dados Pessoais",
    profileNameEn: "Data Protection Officer (DPO)",
    domain: "privacy",
    domainNamePt: "Privacidade",
    domainNameEn: "Privacy",
    completedAt: "2026-05-22T10:30:00Z",
    score: 66,
  },
  {
    id: "ar-7",
    journeyId: "107",
    userId: "3",
    userName: "Mariana Oliveira",
    userEmail: "mariana.oliveira@empresa.com",
    department: "Recursos Humanos",
    profileId: "5",
    profileNamePt: "Membro de Equipe de Resposta a Incidentes",
    profileNameEn: "Incident Response Team Member",
    domain: "security",
    domainNamePt: "Segurança da Informação",
    domainNameEn: "Information Security",
    completedAt: "2026-05-19T09:00:00Z",
    score: 58,
  },
  {
    id: "ar-8",
    journeyId: "108",
    userId: "6",
    userName: "Lucas Pereira",
    userEmail: "lucas.pereira@empresa.com",
    department: "Tecnologia da Informação",
    profileId: "5",
    profileNamePt: "Membro de Equipe de Resposta a Incidentes",
    profileNameEn: "Incident Response Team Member",
    domain: "security",
    domainNamePt: "Segurança da Informação",
    domainNameEn: "Information Security",
    completedAt: "2026-05-14T14:10:00Z",
    score: 79,
  },
  {
    id: "ar-9",
    journeyId: "109",
    userId: "2",
    userName: "Carlos Eduardo Santos",
    userEmail: "carlos.santos@empresa.com",
    department: "Jurídico",
    profileId: "2",
    profileNamePt: "Controlador",
    profileNameEn: "Data Controller",
    domain: "privacy",
    domainNamePt: "Privacidade",
    domainNameEn: "Privacy",
    completedAt: "2026-05-10T15:45:00Z",
    score: 88,
  },
  {
    id: "ar-10",
    journeyId: "110",
    userId: "3",
    userName: "Mariana Oliveira",
    userEmail: "mariana.oliveira@empresa.com",
    department: "Recursos Humanos",
    profileId: "1",
    profileNamePt: "Encarregado pelo Tratamento de Dados Pessoais",
    profileNameEn: "Data Protection Officer (DPO)",
    domain: "privacy",
    domainNamePt: "Privacidade",
    domainNameEn: "Privacy",
    completedAt: "2026-05-02T16:20:00Z",
    score: 72,
  },
  {
    id: "ar-11",
    journeyId: "111",
    userId: "6",
    userName: "Lucas Pereira",
    userEmail: "lucas.pereira@empresa.com",
    department: "Tecnologia da Informação",
    profileId: "4",
    profileNamePt: "Gestor de Segurança da Informação",
    profileNameEn: "Information Security Manager",
    domain: "security",
    domainNamePt: "Segurança da Informação",
    domainNameEn: "Information Security",
    completedAt: "2026-04-25T11:00:00Z",
    score: 82,
  },
  {
    id: "ar-12",
    journeyId: "112",
    userId: "2",
    userName: "Carlos Eduardo Santos",
    userEmail: "carlos.santos@empresa.com",
    department: "Jurídico",
    profileId: "1",
    profileNamePt: "Encarregado pelo Tratamento de Dados Pessoais",
    profileNameEn: "Data Protection Officer (DPO)",
    domain: "privacy",
    domainNamePt: "Privacidade",
    domainNameEn: "Privacy",
    completedAt: "2026-04-20T10:00:00Z",
    score: 95,
  },
  {
    id: "ar-13",
    journeyId: "113",
    userId: "1",
    userName: "Ana Beatriz Silva",
    userEmail: "ana.silva@empresa.com",
    department: "Tecnologia da Informação",
    profileId: "4",
    profileNamePt: "Gestor de Segurança da Informação",
    profileNameEn: "Information Security Manager",
    domain: "security",
    domainNamePt: "Segurança da Informação",
    domainNameEn: "Information Security",
    completedAt: "2026-04-05T09:15:00Z",
    score: 85,
  },
  {
    id: "ar-14",
    journeyId: "114",
    userId: "1",
    userName: "Ana Beatriz Silva",
    userEmail: "ana.silva@empresa.com",
    department: "Tecnologia da Informação",
    profileId: "1",
    profileNamePt: "Encarregado pelo Tratamento de Dados Pessoais",
    profileNameEn: "Data Protection Officer (DPO)",
    domain: "privacy",
    domainNamePt: "Privacidade",
    domainNameEn: "Privacy",
    completedAt: "2026-03-12T14:30:00Z",
    score: 90,
  },
];

function mapRawToAdminResultItem(raw: RawMockAdminResult): AdminResultItem {
  const score = normalizeScore(raw.score);
  return {
    id: raw.id,
    journeyId: raw.journeyId,
    user: {
      id: raw.userId,
      name: raw.userName,
      email: raw.userEmail,
      initials: getInitials(raw.userName),
      department: raw.department,
    },
    profileId: raw.profileId,
    profileTitle: raw.profileNamePt,
    profileNamePt: raw.profileNamePt,
    profileNameEn: raw.profileNameEn,
    domain: raw.domain,
    domainNamePt: raw.domainNamePt,
    domainNameEn: raw.domainNameEn,
    domainLabel: raw.domainNamePt,
    completedAt: raw.completedAt,
    score,
    scoreBand: resolveScoreBand(score),
  };
}

const BASE_ADMIN_RESULTS: AdminResultItem[] = RAW_MOCK_RESULTS
  .map(mapRawToAdminResultItem)
  .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

const DOMAIN_ORDER: Record<JourneyDomain, number> = {
  privacy: 0,
  security: 1,
  joint: 2,
};

function buildFilterOptions(items: AdminResultItem[]): AdminResultsFilterOptions {
  const usersMap = new Map<string, AdminResultUserOption>();
  const departmentsSet = new Set<string>();
  const domainsMap = new Map<JourneyDomain, AdminResultDomainOption>();
  const profilesMap = new Map<string, AdminResultProfileOption>();

  for (const item of items) {
    if (!usersMap.has(item.user.id)) {
      usersMap.set(item.user.id, {
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
      });
    }
    if (item.user.department) {
      departmentsSet.add(item.user.department);
    }
    if (!domainsMap.has(item.domain)) {
      domainsMap.set(item.domain, {
        id: item.domain,
        namePt: item.domainNamePt,
        nameEn: item.domainNameEn,
        label: item.domainLabel,
      });
    }
    if (!profilesMap.has(item.profileId)) {
      profilesMap.set(item.profileId, {
        id: item.profileId,
        namePt: item.profileNamePt,
        nameEn: item.profileNameEn,
        label: item.profileTitle,
      });
    }
  }

  return {
    users: Array.from(usersMap.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    departments: Array.from(departmentsSet).sort((a, b) => a.localeCompare(b, "pt-BR")),
    domains: Array.from(domainsMap.values()).sort(
      (a, b) => (DOMAIN_ORDER[a.id] ?? 99) - (DOMAIN_ORDER[b.id] ?? 99)
    ),
    journeyProfiles: Array.from(profilesMap.values()).sort((a, b) =>
      a.namePt.localeCompare(b.namePt, "pt-BR")
    ),
  };
}

/**
 * Busca resultados concluídos de todos os usuários com filtros avançados,
 * paginação e resumo agregado por domínio.
 *
 * TODO(#158): integrar com o endpoint administrativo do backend quando a
 * história #158 estiver disponível na API.
 */
export async function getAdminResults(
  params: GetAdminResultsParams = {}
): Promise<AdminResultsResponse> {
  const {
    search = "",
    userId = "",
    department = "",
    domains = [],
    journeyProfileId = "",
    dateFrom = "",
    dateTo = "",
    page = 1,
    perPage = 6,
  } = params;

  const filterOptions = buildFilterOptions(BASE_ADMIN_RESULTS);
  let filtered = [...BASE_ADMIN_RESULTS];

  const normalizedSearch = search.trim().toLowerCase();
  if (normalizedSearch) {
    filtered = filtered.filter(
      (item) =>
        item.user.name.toLowerCase().includes(normalizedSearch) ||
        item.user.email.toLowerCase().includes(normalizedSearch) ||
        item.profileTitle.toLowerCase().includes(normalizedSearch) ||
        item.profileNamePt.toLowerCase().includes(normalizedSearch) ||
        item.profileNameEn.toLowerCase().includes(normalizedSearch)
    );
  }

  if (userId) {
    filtered = filtered.filter((item) => item.user.id === userId);
  }

  if (department) {
    filtered = filtered.filter((item) => item.user.department === department);
  }

  if (domains.length > 0) {
    const selectedDomains = new Set<JourneyDomain>(domains);
    filtered = filtered.filter((item) => selectedDomains.has(item.domain));
  }

  if (journeyProfileId) {
    filtered = filtered.filter((item) => item.profileId === journeyProfileId);
  }

  if (dateFrom) {
    filtered = filtered.filter((item) => item.completedAt.slice(0, 10) >= dateFrom);
  }

  if (dateTo) {
    filtered = filtered.filter((item) => item.completedAt.slice(0, 10) <= dateTo);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * perPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + perPage);

  const summary = {
    totalCompletedJourneys: filtered.length,
    totalEvaluatedUsers: new Set(filtered.map((item) => item.user.id)).size,
    domainAverages: computeDomainAverages(filtered, filterOptions.domains),
  };

  return {
    items: paginatedItems,
    total: BASE_ADMIN_RESULTS.length,
    filteredTotal: filtered.length,
    page: safePage,
    limit: perPage,
    totalPages,
    summary,
    filterOptions,
  };
}

