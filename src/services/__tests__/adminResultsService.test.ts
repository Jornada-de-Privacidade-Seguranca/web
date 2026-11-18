import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { axiosInstance } from "../httpClient";
import {
  buildAdminResultsFilterParams,
  getAdminResults,
  getAdminResultsCatalogOptions,
  getAdminResultsFilterOptions,
  getAdminResultsMetrics,
  getDepartments,
  getUsersWithResults,
  mapAdminResultItem,
  mapAdminResultMetrics,
} from "../adminResultsService";
import type {
  AdminResultItemApi,
  AdminResultMetricsDataApi,
} from "@features/admin-results/adminResults.types";

function mockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as AxiosResponse["config"],
  };
}

function mockAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    data,
    status,
    statusText: "",
    headers: {},
    config: {} as AxiosResponse["config"],
  } as AxiosResponse);
}

const API_ITEM: AdminResultItemApi = {
  id: 99,
  user: { id: 2, name: "Carlos Eduardo", email: "carlos@empresa.com", department: "TI" },
  journey_profile: { id: 6, name_pt: "Auditor de Conformidade", name_en: "Compliance Auditor" },
  knowledge_domain: { id: 3, name_pt: "Conjunta", name_en: "Joint" },
  finished_at: "2026-05-10 14:00:00",
  score: 84.6,
};

const METRICS: AdminResultMetricsDataApi = {
  total_completed_journeys: 4,
  distinct_users_count: 3,
  domains: [
    { domain_id: 1, domain_name_pt: "Privacidade", domain_name_en: "Privacy", completed_journeys: 2, average_score: 71.5 },
    { domain_id: 2, domain_name_pt: "Segurança da Informação", domain_name_en: "Information Security", completed_journeys: 0, average_score: null },
    { domain_id: 3, domain_name_pt: "Conjunta", domain_name_en: "Joint", completed_journeys: 2, average_score: 90 },
  ],
};

const FORBIDDEN_BODY = {
  success: false,
  message: "Voce nao possui permissao para executar esta acao.",
  errors: [],
  code: "PERMISSION_DENIED",
};

function journeyProfile(id: number, namePt: string, domainId: number, domainNamePt: string, domainNameEn: string) {
  return {
    id,
    name_pt: namePt,
    name_en: `${namePt} (en)`,
    description_pt: null,
    description_en: null,
    type: domainId,
    knowledge_domain: { id: domainId, name_pt: domainNamePt, name_en: domainNameEn },
  };
}

describe("adminResultsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("buildAdminResultsFilterParams", () => {
    it("converte os filtros da tela nos parâmetros da API", () => {
      expect(
        buildAdminResultsFilterParams({
          search: "  carlos  ",
          userId: "2",
          department: "TI",
          domains: ["privacy", "joint"],
          journeyProfileId: "6",
          dateFrom: "2026-05-01",
          dateTo: "2026-05-31",
        })
      ).toEqual({
        search: "carlos",
        user_id: 2,
        department: "TI",
        "domains[]": [1, 3],
        journey_profile_id: 6,
        ended_from: "2026-05-01",
        ended_to: "2026-05-31",
      });
    });

    it("não envia a busca vazia ou só com espaços, nem filtros vazios", () => {
      expect(buildAdminResultsFilterParams({ search: "   ", domains: [], userId: "" })).toEqual({});
    });
  });

  describe("getAdminResults", () => {
    it("chama GET /admin/results com os filtros e a paginação, e mapeia a resposta", async () => {
      const controller = new AbortController();
      const requestSpy = vi.spyOn(axiosInstance, "request").mockResolvedValueOnce(
        mockResponse({
          success: true,
          data: [API_ITEM],
          meta: {
            pagination: { current_page: 2, per_page: 6, total: 13, last_page: 3, has_next_page: true },
          },
        })
      );

      const page = await getAdminResults(
        { search: " carlos ", domains: ["joint"], page: 2, perPage: 6 },
        controller.signal
      );

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/admin/results",
          params: { search: "carlos", "domains[]": [3], page: 2, per_page: 6 },
          signal: controller.signal,
        })
      );
      expect(page).toMatchObject({ total: 13, page: 2, limit: 6, totalPages: 3 });
      expect(page.items[0]).toMatchObject({
        id: "99",
        journeyId: "99",
        user: { id: "2", name: "Carlos Eduardo", initials: "CE", department: "TI" },
        profileId: "6",
        domain: "joint",
        completedAt: "2026-05-10T14:00:00Z",
        score: 85,
      });
    });

    it("propaga o 403 da API", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(mockAxiosError(403, FORBIDDEN_BODY));

      await expect(getAdminResults()).rejects.toMatchObject({ status: 403, code: "PERMISSION_DENIED" });
    });

    it("propaga o erro do servidor, sem resultados de exemplo", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(
        mockAxiosError(500, { success: false, message: "Erro interno" })
      );

      await expect(getAdminResults()).rejects.toMatchObject({ status: 500 });
    });
  });

  describe("getAdminResultsMetrics", () => {
    it("chama GET /admin/results/metrics com os mesmos filtros da listagem", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: METRICS }));

      const summary = await getAdminResultsMetrics({ userId: "2", dateTo: "2026-05-31" });

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/admin/results/metrics",
          params: { user_id: 2, ended_to: "2026-05-31" },
        })
      );
      expect(summary.totalCompletedJourneys).toBe(4);
      expect(summary.totalEvaluatedUsers).toBe(3);
      expect(summary.domainAverages.map((domain) => [domain.domain, domain.averageScore])).toEqual([
        ["privacy", 72],
        ["security", null],
        ["joint", 90],
      ]);
    });

    it("propaga o 403 da API", async () => {
      vi.spyOn(axiosInstance, "request").mockRejectedValueOnce(mockAxiosError(403, FORBIDDEN_BODY));

      await expect(getAdminResultsMetrics()).rejects.toMatchObject({ status: 403 });
    });
  });

  describe("opções dos filtros", () => {
    it("busca setores e usuários com resultados", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: ["Jurídico", "TI"] }))
        .mockResolvedValueOnce(
          mockResponse({ success: true, data: [{ id: 2, name: "Carlos Eduardo", email: "carlos@empresa.com" }] })
        );

      await expect(getDepartments()).resolves.toEqual(["Jurídico", "TI"]);
      await expect(getUsersWithResults()).resolves.toEqual([
        { id: "2", name: "Carlos Eduardo", email: "carlos@empresa.com" },
      ]);
      expect(requestSpy.mock.calls.map(([config]) => config.url)).toEqual([
        "/users/departments",
        "/users/with-results",
      ]);
    });

    it("monta os perfis e os domínios a partir do catálogo, percorrendo todas as páginas", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(
          mockResponse({
            success: true,
            data: [
              journeyProfile(4, "Operador", 1, "Privacidade", "Privacy"),
              journeyProfile(6, "Auditor", 3, "Conjunta", "Joint"),
            ],
            meta: { pagination: { current_page: 1, per_page: 100, total: 3, last_page: 2, has_next_page: true } },
          })
        )
        .mockResolvedValueOnce(
          mockResponse({
            success: true,
            data: [journeyProfile(2, "Gestor de Segurança", 2, "Segurança da Informação", "Information Security")],
            meta: { pagination: { current_page: 2, per_page: 100, total: 3, last_page: 2, has_next_page: false } },
          })
        );

      const catalog = await getAdminResultsCatalogOptions();

      expect(requestSpy.mock.calls.map(([config]) => config.params)).toEqual([
        { page: 1, per_page: 100 },
        { page: 2, per_page: 100 },
      ]);
      expect(catalog.journeyProfiles.map((profile) => profile.namePt)).toEqual([
        "Auditor",
        "Gestor de Segurança",
        "Operador",
      ]);
      expect(catalog.domains).toEqual([
        { id: "privacy", namePt: "Privacidade", nameEn: "Privacy", label: "Privacidade" },
        {
          id: "security",
          namePt: "Segurança da Informação",
          nameEn: "Information Security",
          label: "Segurança da Informação",
        },
        { id: "joint", namePt: "Conjunta", nameEn: "Joint", label: "Conjunta" },
      ]);
    });

    it("falha as opções inteiras quando um dos endpoints falha", async () => {
      vi.spyOn(axiosInstance, "request").mockImplementation(async (config) => {
        if (config.url === "/users/departments") {
          throw mockAxiosError(500, { success: false, message: "Erro interno" });
        }
        if (config.url === "/journey-profiles") {
          return mockResponse({
            success: true,
            data: [],
            meta: { pagination: { current_page: 1, per_page: 100, total: 0, last_page: 1, has_next_page: false } },
          });
        }
        return mockResponse({ success: true, data: [] });
      });

      await expect(getAdminResultsFilterOptions()).rejects.toMatchObject({ status: 500 });
    });
  });

  describe("mappers", () => {
    it("mapAdminResultItem lida com campos nulos", () => {
      const item = mapAdminResultItem({
        id: 7,
        user: null,
        journey_profile: null,
        knowledge_domain: null,
        finished_at: null,
        score: null,
      });

      expect(item).toMatchObject({
        id: "7",
        user: { id: "", name: "", email: "", department: "" },
        profileId: "",
        profileTitle: "",
        domain: "joint",
        completedAt: "",
        score: 0,
      });
    });

    it("mapAdminResultMetrics ignora domínios desconhecidos e mantém null sem jornada", () => {
      const summary = mapAdminResultMetrics({
        ...METRICS,
        domains: [
          ...METRICS.domains,
          { domain_id: 9, domain_name_pt: "Outro", domain_name_en: "Other", completed_journeys: 1, average_score: 50 },
        ],
      });

      expect(summary.domainAverages).toHaveLength(3);
      expect(summary.domainAverages[1]).toMatchObject({ domain: "security", averageScore: null, completedCount: 0 });
    });
  });
});
