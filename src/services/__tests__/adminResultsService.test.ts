import { describe, it, expect, vi, beforeEach } from "vitest";
import * as httpClient from "@services/httpClient";
import { ApiRequestError } from "@services/httpClient";
import {
  getAdminResults,
  getAdminResultsMetrics,
  getDepartments,
  getUsersWithResults,
  getJourneyProfileFilterOptions,
  getAdminResultsFilterOptions,
  mapAdminResultItem,
  mapAdminResultMetrics,
  mapUsersWithResults,
  type AdminResultItemApi,
  type AdminResultMetricsDataApi,
  type UserWithResultsItemApi,
} from "../adminResultsService";

describe("adminResultsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Por padrão, simula indisponibilidade de backend para exercitar os fallbacks de mock de forma isolada
    vi.spyOn(httpClient, "apiRequestWithMeta").mockRejectedValue(
      new ApiRequestError("Network error")
    );
    vi.spyOn(httpClient, "apiRequest").mockRejectedValue(
      new ApiRequestError("Network error")
    );
  });

  describe("Integração com API (Backend #158 / PR 83)", () => {
    it("deve enviar parâmetros mapeados e normalizados no GET /admin/results", async () => {
      const apiItem: AdminResultItemApi = {
        id: 99,
        user: {
          id: 2,
          name: "Carlos Eduardo",
          email: "carlos@empresa.com",
          department: "TI",
        },
        journey_profile: {
          id: 6,
          name_pt: "Auditor",
          name_en: "Auditor",
        },
        knowledge_domain: {
          id: 1,
          name_pt: "Privacidade",
          name_en: "Privacy",
        },
        finished_at: "2026-05-10 14:00:00",
        score: 95,
      };

      const spy = vi.spyOn(httpClient, "apiRequestWithMeta").mockResolvedValue({
        data: [apiItem],
        meta: {
          pagination: {
            total: 25,
            count: 1,
            per_page: 10,
            current_page: 2,
            total_pages: 3,
          },
        },
      });

      const response = await getAdminResults({
        search: "   Carlos   ",
        userId: "2",
        department: "TI",
        domains: ["privacy", "joint"],
        journeyProfileId: "6",
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
        page: 2,
        perPage: 10,
      });

      expect(spy).toHaveBeenCalledWith(
        "/admin/results",
        {
          params: {
            search: "Carlos",
            user_id: 2,
            department: "TI",
            "domains[]": [1, 3],
            journey_profile_id: 6,
            ended_from: "2026-05-01",
            ended_to: "2026-05-31",
            page: 2,
            per_page: 10,
          },
        },
        "Não foi possível carregar os resultados dos usuários."
      );

      expect(response.total).toBe(25);
      expect(response.filteredTotal).toBe(25);
      expect(response.page).toBe(2);
      expect(response.limit).toBe(10);
      expect(response.totalPages).toBe(3);
      expect(response.items).toHaveLength(1);
      expect(response.items[0].id).toBe("99");
      expect(response.items[0].user.name).toBe("Carlos Eduardo");
      expect(response.items[0].domain).toBe("privacy");
    });

    it("deve enviar parâmetros mapeados no GET /admin/results/metrics", async () => {
      const metricsDataApi: AdminResultMetricsDataApi = {
        total_completed_journeys: 12,
        distinct_users_count: 5,
        domains: [
          {
            domain_id: 1,
            domain_name_pt: "Privacidade",
            domain_name_en: "Privacy",
            completed_journeys: 6,
            average_score: 88,
          },
          {
            domain_id: 2,
            domain_name_pt: "Segurança da Informação",
            domain_name_en: "Information Security",
            completed_journeys: 6,
            average_score: 82,
          },
        ],
      };

      const spy = vi.spyOn(httpClient, "apiRequest").mockResolvedValue(metricsDataApi);

      const metrics = await getAdminResultsMetrics({
        search: "  segurança  ",
        userId: "3",
        department: "Compliance",
        domains: ["security"],
        journeyProfileId: "4",
        dateFrom: "2026-01-01",
        dateTo: "2026-06-30",
      });

      expect(spy).toHaveBeenCalledWith(
        "/admin/results/metrics",
        {
          params: {
            search: "segurança",
            user_id: 3,
            department: "Compliance",
            "domains[]": [2],
            journey_profile_id: 4,
            ended_from: "2026-01-01",
            ended_to: "2026-06-30",
          },
        },
        "Não foi possível carregar as métricas dos resultados."
      );

      expect(metrics.totalCompletedJourneys).toBe(12);
      expect(metrics.totalEvaluatedUsers).toBe(5);
      expect(metrics.domainAverages).toHaveLength(2);
      expect(metrics.domainAverages[0].averageScore).toBe(88);
    });

    it("deve consumir GET /users/departments via apiRequest", async () => {
      vi.spyOn(httpClient, "apiRequest").mockResolvedValue(["RH", "Financeiro"]);
      const departments = await getDepartments();
      expect(departments).toEqual(["RH", "Financeiro"]);
    });

    it("deve consumir GET /users/with-results via apiRequest e mapear os usuários", async () => {
      vi.spyOn(httpClient, "apiRequest").mockResolvedValue([
        { id: 10, name: "Maria", email: "maria@empresa.com" },
      ]);
      const users = await getUsersWithResults();
      expect(users).toEqual([{ id: "10", name: "Maria", email: "maria@empresa.com" }]);
    });

    it("deve acionar fallback para mock quando backend responder 404 (rota inexistente)", async () => {
      vi.spyOn(httpClient, "apiRequestWithMeta").mockRejectedValue(
        new ApiRequestError("Route not found", 404)
      );

      const response = await getAdminResults({ page: 1, perPage: 5 });
      expect(response.items).toHaveLength(5);
      expect(response.total).toBe(14);
    });

    it("deve acionar fallback para mock quando backend responder 401 (não autenticado como admin)", async () => {
      vi.spyOn(httpClient, "apiRequestWithMeta").mockRejectedValue(
        new ApiRequestError("Unauthorized", 401)
      );

      const response = await getAdminResults({ page: 1, perPage: 5 });
      expect(response.items).toHaveLength(5);
      expect(response.total).toBe(14);
    });

    it("deve relançar erro quando status for de erro interno (500) e não elegível para fallback", async () => {
      vi.spyOn(httpClient, "apiRequestWithMeta").mockRejectedValue(
        new ApiRequestError("Internal Server Error", 500)
      );

      await expect(getAdminResults()).rejects.toThrow("Internal Server Error");
    });
  });

  describe("getAdminResults (GET /admin/results)", () => {
    it("deve retornar lista paginada mapeada para a tela", async () => {
      const response = await getAdminResults({ page: 1, perPage: 6 });

      expect(response.items).toHaveLength(6);
      expect(response.total).toBe(14);
      expect(response.filteredTotal).toBe(14);
      expect(response.page).toBe(1);
      expect(response.totalPages).toBe(3);

      const firstItem = response.items[0];
      expect(firstItem.id).toBe("101");
      expect(firstItem.user.name).toBe("Ana Beatriz Silva");
      expect(firstItem.user.initials).toBe("AS");
      expect(firstItem.domain).toBe("joint");
      expect(firstItem.scoreBand).toBe("strong");
    });

    it("deve filtrar por busca textual (nome, e-mail e perfil em PT ou EN)", async () => {
      const byName = await getAdminResults({ search: "carlos" });
      expect(byName.filteredTotal).toBe(2);
      expect(byName.items.every((item) => item.user.id === "2")).toBe(true);

      const byEmail = await getAdminResults({ search: "mariana.oliveira@empresa.com" });
      expect(byEmail.filteredTotal).toBe(2);

      const byProfileEn = await getAdminResults({ search: "Data Controller" });
      expect(byProfileEn.filteredTotal).toBe(1);
      expect(byProfileEn.items[0].profileNamePt).toBe("Controlador");
    });

    it("deve filtrar por usuário, setor, múltiplos domínios e perfil de jornada", async () => {
      const byUser = await getAdminResults({ userId: "2" });
      expect(byUser.filteredTotal).toBe(2);
      expect(byUser.items.every((item) => item.user.id === "2")).toBe(true);

      const byDepartment = await getAdminResults({ department: "Tecnologia da Informação" });
      expect(byDepartment.filteredTotal).toBe(7);

      const byDomains = await getAdminResults({ domains: ["privacy", "joint"], perPage: 20 });
      expect(byDomains.filteredTotal).toBe(8);
      expect(
        byDomains.items.every((item) => item.domain === "privacy" || item.domain === "joint")
      ).toBe(true);

      const byProfile = await getAdminResults({ journeyProfileId: "6" });
      expect(byProfile.filteredTotal).toBe(3);
    });

    it("deve filtrar por período de conclusão", async () => {
      const byPeriod = await getAdminResults({
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
        perPage: 20,
      });
      expect(byPeriod.filteredTotal).toBe(7);
      expect(
        byPeriod.items.every(
          (item) =>
            item.completedAt.slice(0, 10) >= "2026-05-01" &&
            item.completedAt.slice(0, 10) <= "2026-05-31"
        )
      ).toBe(true);
    });

    it("deve paginar corretamente e retornar lista vazia quando nenhum resultado corresponder", async () => {
      const page2 = await getAdminResults({ page: 2, perPage: 6 });
      expect(page2.page).toBe(2);
      expect(page2.items).toHaveLength(6);

      const page3 = await getAdminResults({ page: 3, perPage: 6 });
      expect(page3.page).toBe(3);
      expect(page3.items).toHaveLength(2);

      const empty = await getAdminResults({ search: "inexistente-xyz" });
      expect(empty.items).toHaveLength(0);
      expect(empty.filteredTotal).toBe(0);
      expect(empty.total).toBe(14);
      expect(empty.totalPages).toBe(1);
    });
  });

  describe("getAdminResultsMetrics (GET /admin/results/metrics)", () => {
    it("deve retornar métricas agregadas por domínio sem média geral", async () => {
      const metrics = await getAdminResultsMetrics();

      expect(metrics.totalCompletedJourneys).toBe(14);
      expect(metrics.totalEvaluatedUsers).toBe(6);
      expect(metrics.domainAverages).toHaveLength(3);
      expect("averageScore" in metrics).toBe(false);

      const privacy = metrics.domainAverages.find((d) => d.domain === "privacy");
      const security = metrics.domainAverages.find((d) => d.domain === "security");
      const joint = metrics.domainAverages.find((d) => d.domain === "joint");

      expect(privacy?.averageScore).toBe(82);
      expect(security?.averageScore).toBe(79);
      expect(joint?.averageScore).toBe(77);
    });

    it("deve atualizar métricas respeitando filtros e retornar null em domínios sem jornadas", async () => {
      // Usuário 2 possui 2 jornadas de Privacidade e nenhuma nos demais domínios
      const metrics = await getAdminResultsMetrics({ userId: "2" });

      expect(metrics.totalCompletedJourneys).toBe(2);
      expect(metrics.totalEvaluatedUsers).toBe(1);

      const privacy = metrics.domainAverages.find((d) => d.domain === "privacy");
      const security = metrics.domainAverages.find((d) => d.domain === "security");
      const joint = metrics.domainAverages.find((d) => d.domain === "joint");

      expect(privacy?.averageScore).toBe(92);
      expect(security?.averageScore).toBeNull();
      expect(joint?.averageScore).toBeNull();
    });
  });

  describe("Endpoints auxiliares de filtros", () => {
    it("getDepartments deve retornar setores cadastrados", async () => {
      const departments = await getDepartments();
      expect(departments).toContain("Tecnologia da Informação");
      expect(departments).toContain("Compliance");
      expect(departments).toContain("Jurídico");
    });

    it("getUsersWithResults deve retornar usuários avaliados", async () => {
      const users = await getUsersWithResults();
      expect(users.length).toBeGreaterThan(0);
      expect(users.some((u) => u.name === "Ana Beatriz Silva")).toBe(true);
    });

    it("getJourneyProfileFilterOptions e getAdminResultsFilterOptions devem compor opções dos filtros", async () => {
      const profiles = await getJourneyProfileFilterOptions();
      expect(profiles.length).toBeGreaterThan(0);

      const filterOptions = await getAdminResultsFilterOptions();
      expect(filterOptions.users.length).toBeGreaterThan(0);
      expect(filterOptions.departments.length).toBeGreaterThan(0);
      expect(filterOptions.domains.map((d) => d.id)).toEqual(["privacy", "security", "joint"]);
      expect(filterOptions.journeyProfiles.length).toBeGreaterThan(0);
    });
  });

  describe("Mappers (resposta da API → tela)", () => {
    it("mapAdminResultItem deve mapear campos da API backend #158 corretamente", () => {
      const apiItem: AdminResultItemApi = {
        id: 42,
        user: {
          id: 5,
          name: "João da Silva",
          email: "joao.silva@empresa.com",
          department: "Segurança Cibernética",
        },
        journey_profile: {
          id: 4,
          name_pt: "Gestor de Segurança",
          name_en: "Security Manager",
        },
        knowledge_domain: {
          id: 2,
          name_pt: "Segurança da Informação",
          name_en: "Information Security",
        },
        finished_at: "2026-07-15 10:30:00",
        score: 87.4,
      };

      const mapped = mapAdminResultItem(apiItem);

      expect(mapped.id).toBe("42");
      expect(mapped.journeyId).toBe("42");
      expect(mapped.user.id).toBe("5");
      expect(mapped.user.name).toBe("João da Silva");
      expect(mapped.user.initials).toBe("JS");
      expect(mapped.user.department).toBe("Segurança Cibernética");
      expect(mapped.profileId).toBe("4");
      expect(mapped.profileNamePt).toBe("Gestor de Segurança");
      expect(mapped.profileNameEn).toBe("Security Manager");
      expect(mapped.domain).toBe("security");
      expect(mapped.domainNamePt).toBe("Segurança da Informação");
      expect(mapped.completedAt).toBe("2026-07-15 10:30:00");
      expect(mapped.score).toBe(87);
      expect(mapped.scoreBand).toBe("strong");
    });

    it("mapAdminResultItem deve lidar com campos nulos e faixas de nota", () => {
      const weakItem: AdminResultItemApi = {
        id: 43,
        user: {
          id: null,
          name: null,
          email: null,
          department: null,
        },
        journey_profile: {
          id: null,
          name_pt: null,
          name_en: null,
        },
        knowledge_domain: {
          id: null,
          name_pt: null,
          name_en: null,
        },
        finished_at: null,
        score: 45,
      };

      const mappedWeak = mapAdminResultItem(weakItem);
      expect(mappedWeak.user.name).toBe("");
      expect(mappedWeak.user.initials).toBe("");
      expect(mappedWeak.domain).toBe("joint");
      expect(mappedWeak.score).toBe(45);
      expect(mappedWeak.scoreBand).toBe("weak");

      const mediumItem: AdminResultItemApi = {
        ...weakItem,
        score: 65,
      };
      expect(mapAdminResultItem(mediumItem).scoreBand).toBe("medium");
    });

    it("mapAdminResultMetrics deve mapear métricas e manter averageScore como null para domínio sem jornadas", () => {
      const apiMetrics: AdminResultMetricsDataApi = {
        total_completed_journeys: 10,
        distinct_users_count: 7,
        domains: [
          {
            domain_id: 1,
            domain_name_pt: "Privacidade",
            domain_name_en: "Privacy",
            completed_journeys: 10,
            average_score: 85.3,
          },
          {
            domain_id: 2,
            domain_name_pt: "Segurança da Informação",
            domain_name_en: "Information Security",
            completed_journeys: 0,
            average_score: null,
          },
        ],
      };

      const mapped = mapAdminResultMetrics(apiMetrics);

      expect(mapped.totalCompletedJourneys).toBe(10);
      expect(mapped.totalEvaluatedUsers).toBe(7);
      expect(mapped.domainAverages).toHaveLength(2);

      const privacy = mapped.domainAverages.find((d) => d.domain === "privacy");
      expect(privacy?.averageScore).toBe(85);
      expect(privacy?.completedCount).toBe(10);

      const security = mapped.domainAverages.find((d) => d.domain === "security");
      expect(security?.averageScore).toBeNull();
      expect(security?.completedCount).toBe(0);
    });

    it("mapUsersWithResults deve mapear a lista de usuários da API para opções de filtro", () => {
      const apiUsers: UserWithResultsItemApi[] = [
        { id: 1, name: "Carlos", email: "carlos@example.com" },
        { id: 2, name: null, email: null },
      ];

      const mapped = mapUsersWithResults(apiUsers);

      expect(mapped).toEqual([
        { id: "1", name: "Carlos", email: "carlos@example.com" },
        { id: "2", name: "", email: "" },
      ]);
    });
  });
});
