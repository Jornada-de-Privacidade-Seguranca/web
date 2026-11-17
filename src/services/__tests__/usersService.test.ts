import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import {
  getUsersList,
  getUserById,
  getUserDepartments,
  updateUser,
  changeUserAccessProfile,
  toggleUserStatus,
  deleteUser,
  getAccessProfiles,
  getAssignableJourneyProfiles,
  assignJourneyToUser,
  cancelAssignedJourney,
  getInitials,
  inviteUser,
  type UserManagementApiItem,
  type UserJourneyApiItem,
} from "../usersService";
import { ApiRequestError, axiosInstance, clearCsrfToken } from "../httpClient";

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

function apiUser(overrides: Partial<UserManagementApiItem> = {}): UserManagementApiItem {
  return {
    id: 7,
    name: "Maria Silva",
    email: "maria.silva@example.com",
    organization: "Secretaria",
    department: "Privacidade",
    registration_number: "MAT-007",
    access_profile: { id: 2, name: "Gestor" },
    status: "active",
    active_status: 1,
    completed_journeys_count: 3,
    created_at: "2026-11-01 10:00:00",
    ...overrides,
  };
}

function apiJourney(id: number, overrides: Partial<UserJourneyApiItem> = {}): UserJourneyApiItem {
  return {
    id,
    journey_profile: {
      id: 1,
      name_pt: "Encarregado de Dados",
      name_en: "Data Protection Officer",
      knowledge_domain: { id: 1, name_pt: "Privacidade", name_en: "Privacy" },
    },
    started_at: "2026-10-01 09:00:00",
    finished_at: "2026-10-20 18:00:00",
    origin: "self_started",
    assigned_by: null,
    status: "completed",
    score: 88,
    ...overrides,
  };
}

type Handler = (config: AxiosRequestConfig) => unknown;

/** Responde o token CSRF e delega as demais requisições ao handler. */
function mockRequests(handler: Handler) {
  return vi.spyOn(axiosInstance, "request").mockImplementation(async (config) => {
    if (config.url === "/auth/csrf-token") {
      return mockResponse({ success: true, data: { csrf_token: "token-123" } });
    }
    return handler(config) as AxiosResponse;
  });
}

function callsTo(spy: ReturnType<typeof mockRequests>, url: string) {
  return spy.mock.calls.map(([config]) => config).filter((config) => config.url === url);
}

describe("usersService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearCsrfToken();
  });

  it("calcula as iniciais do nome", () => {
    expect(getInitials("Carlos Santos")).toBe("CS");
    expect(getInitials("Ana")).toBe("AN");
    expect(getInitials("Maria Eduarda Silva")).toBe("MS");
    expect(getInitials("")).toBe("");
  });

  describe("getUsersList", () => {
    it("envia busca, filtros e paginação à API e mapeia os itens", async () => {
      const spy = mockRequests(() =>
        mockResponse({
          success: true,
          data: [apiUser(), apiUser({ id: 8, access_profile: null, status: "pending_activation", name: null, completed_journeys_count: undefined })],
          meta: { pagination: { current_page: 2, per_page: 10, total: 12, last_page: 2, has_next_page: false } },
        })
      );

      const result = await getUsersList({
        search: "  maria ",
        department: "Privacidade",
        role: "manager",
        status: "pending",
        page: 2,
        perPage: 10,
      });

      const [config] = callsTo(spy, "/users");
      expect(config.params).toEqual({
        page: 2,
        per_page: 10,
        search: "maria",
        department: "Privacidade",
        profile_type_id: 2,
        status: "pending_activation",
      });
      expect(result).toMatchObject({ total: 12, page: 2, perPage: 10, totalPages: 2 });
      expect(result.items[0]).toEqual({
        id: "7",
        name: "Maria Silva",
        email: "maria.silva@example.com",
        initials: "MS",
        employeeCode: "MAT-007",
        department: "Privacidade",
        organization: "Secretaria",
        role: "manager",
        profileTypeId: 2,
        roleLabel: "Gestor",
        status: "active",
        journeysCount: 3,
        createdAt: "2026-11-01 10:00:00",
      });
      expect(result.items[1]).toMatchObject({
        name: "",
        initials: "MA",
        role: "user",
        profileTypeId: null,
        roleLabel: "—",
        status: "pending",
        journeysCount: 0,
      });
    });

    it("não envia filtros vazios", async () => {
      const spy = mockRequests(() => mockResponse({ success: true, data: [], meta: {} }));

      const result = await getUsersList();

      expect(callsTo(spy, "/users")[0].params).toEqual({ page: 1, per_page: 10 });
      expect(result).toMatchObject({ items: [], total: 0, totalPages: 1 });
    });

    it("propaga o erro da API como ApiRequestError", async () => {
      mockRequests(() => {
        throw mockAxiosError(403, { success: false, message: "Sem permissão", code: "PERMISSION_DENIED" });
      });

      await expect(getUsersList()).rejects.toMatchObject({
        status: 403,
        code: "PERMISSION_DENIED",
      });
    });
  });

  it("getUserDepartments devolve os setores", async () => {
    mockRequests(() => mockResponse({ success: true, data: ["Jurídico", "TI", ""] }));

    await expect(getUserDepartments()).resolves.toEqual(["Jurídico", "TI"]);
  });

  describe("getUserById", () => {
    it("junta o usuário, as jornadas finalizadas e a em andamento no idioma pedido", async () => {
      const spy = mockRequests((config) => {
        if (config.url === "/users/7") {
          return mockResponse({ success: true, data: { ...apiUser(), journey_profile_id: 4 } });
        }
        if (config.url === "/users/7/journeys" && config.params?.status === "completed") {
          return mockResponse({ success: true, data: [apiJourney(11)] });
        }
        if (config.url === "/users/7/journeys" && config.params?.status === "ongoing") {
          return mockResponse({
            success: true,
            data: [
              apiJourney(12, {
                status: "ongoing",
                finished_at: null,
                score: null,
                origin: "assigned",
                assigned_by: { id: 1, name: "Admin" },
                journey_profile: {
                  id: 2,
                  name_pt: "Gestor de Segurança",
                  name_en: "Security Manager",
                  knowledge_domain: { id: 2, name_pt: "Segurança", name_en: "Security" },
                },
              }),
            ],
          });
        }
        throw new Error(`unexpected ${config.url}`);
      });

      const user = await getUserById("7", "en");

      expect(callsTo(spy, "/users/7/journeys").map((c) => c.params)).toEqual([
        { status: "completed", page: 1, per_page: 100 },
        { status: "ongoing", page: 1, per_page: 1 },
      ]);
      expect(user).toMatchObject({ id: "7", role: "manager", initialJourneyProfileId: 4 });
      expect(user.journeys).toEqual([
        {
          id: "11",
          title: "Data Protection Officer",
          domain: "privacy",
          domainLabel: "Privacy",
          completedAt: "2026-10-20 18:00:00",
          score: 88,
        },
      ]);
      expect(user.activeJourney).toMatchObject({
        id: "12",
        profileId: 2,
        title: "Security Manager",
        domain: "security",
        origin: "assigned",
        assignedBy: { id: 1, name: "Admin" },
      });
    });

    it("rejeita com 404 para usuário inexistente", async () => {
      mockRequests((config) => {
        if (config.url === "/users/99") {
          throw mockAxiosError(404, { success: false, message: "Usuario nao encontrado.", code: "USER_NOT_FOUND" });
        }
        return mockResponse({ success: true, data: [] });
      });

      const error = await getUserById("99").catch((err: unknown) => err);
      expect(error).toBeInstanceOf(ApiRequestError);
      expect(error).toMatchObject({ status: 404, code: "USER_NOT_FOUND" });
    });
  });

  describe("mutações", () => {
    it("updateUser envia só os campos alterados, com o código como registration_number e CSRF", async () => {
      const spy = mockRequests(() => mockResponse({ success: true, data: apiUser() }));

      await updateUser("7", { name: " Maria Souza ", employeeCode: "MAT-9" });

      const [config] = callsTo(spy, "/users/7");
      expect(config.method).toBe("PATCH");
      expect(config.data).toEqual({ name: "Maria Souza", registration_number: "MAT-9" });
      expect(config.headers).toMatchObject({ "X-CSRF-TOKEN": "token-123" });
    });

    it("updateUser preserva os erros por campo do 422 e o código do 409", async () => {
      mockRequests(() => {
        throw mockAxiosError(422, {
          success: false,
          message: "Validation error.",
          code: "VALIDATION_ERROR",
          errors: { name: ["Informe nome e sobrenome."] },
        });
      });
      await expect(updateUser("7", { name: "Maria" })).rejects.toMatchObject({
        status: 422,
        errors: { name: ["Informe nome e sobrenome."] },
      });

      vi.restoreAllMocks();
      mockRequests(() => {
        throw mockAxiosError(409, { success: false, message: "E-mail em uso", code: "EMAIL_ALREADY_IN_USE" });
      });
      await expect(updateUser("7", { email: "outro@example.com" })).rejects.toMatchObject({
        status: 409,
        code: "EMAIL_ALREADY_IN_USE",
      });
    });

    it("changeUserAccessProfile envia o id do perfil por PUT", async () => {
      const spy = mockRequests(() => mockResponse({ success: true, data: apiUser() }));

      await changeUserAccessProfile("7", "admin");

      const [config] = callsTo(spy, "/users/7/access-profile");
      expect(config.method).toBe("PUT");
      expect(config.data).toEqual({ profile_type_id: 1 });
    });

    it("changeUserAccessProfile propaga LAST_ADMIN_REQUIRED", async () => {
      mockRequests(() => {
        throw mockAxiosError(409, { success: false, message: "Ultimo admin", code: "LAST_ADMIN_REQUIRED" });
      });

      await expect(changeUserAccessProfile("7", "user")).rejects.toMatchObject({
        code: "LAST_ADMIN_REQUIRED",
      });
    });

    it("toggleUserStatus chama activate ou deactivate", async () => {
      const spy = mockRequests(() => mockResponse({ success: true, data: { id: 7, active_status: 1 } }));

      await toggleUserStatus("7", "active");
      await toggleUserStatus("7", "inactive");

      expect(callsTo(spy, "/admin/users/7/activate")[0].method).toBe("POST");
      expect(callsTo(spy, "/admin/users/7/deactivate")[0].method).toBe("POST");
    });

    it("toggleUserStatus propaga SELF_DEACTIVATION_FORBIDDEN", async () => {
      mockRequests(() => {
        throw mockAxiosError(403, { success: false, message: "Propria conta", code: "SELF_DEACTIVATION_FORBIDDEN" });
      });

      await expect(toggleUserStatus("7", "inactive")).rejects.toMatchObject({
        status: 403,
        code: "SELF_DEACTIVATION_FORBIDDEN",
      });
    });

    it("deleteUser envia DELETE e propaga o erro da API", async () => {
      const spy = mockRequests(() => mockResponse({ success: true, data: null }));
      await deleteUser("7");
      expect(callsTo(spy, "/users/7")[0].method).toBe("DELETE");

      vi.restoreAllMocks();
      mockRequests(() => {
        throw mockAxiosError(403, { success: false, message: "Propria conta", code: "SELF_DELETION_FORBIDDEN" });
      });
      await expect(deleteUser("7")).rejects.toMatchObject({ code: "SELF_DELETION_FORBIDDEN" });
    });
  });

  it("getAccessProfiles mapeia o perfil e descreve as permissões no idioma pedido", async () => {
    mockRequests(() =>
      mockResponse({
        success: true,
        data: [
          {
            id: 3,
            name: "Usuario",
            permissions: [
              { id: 1, code: "journeys.take", description_pt: "Responder jornadas", description_en: "Take journeys" },
              { id: 2, code: "results.view_own", description_pt: "Ver os próprios resultados", description_en: null },
            ],
          },
          { id: 9, name: "Auditor", permissions: [] },
        ],
      })
    );

    const profiles = await getAccessProfiles("en");

    expect(profiles[0]).toEqual({
      id: 3,
      role: "user",
      name: "Usuario",
      description: "",
      isDefault: true,
      permissions: ["Take journeys", "Ver os próprios resultados"],
    });
    expect(profiles[1]).toMatchObject({ id: 9, role: null, isDefault: false, permissions: [] });
  });

  describe("mocks mantidos até a #176 e a #170", () => {
    it("inviteUser cria convite pendente e responde 409 para e-mail já cadastrado", async () => {
      const response = await inviteUser({ email: "Novo.Convidado@Empresa.com", role: "manager" });
      expect(response).toMatchObject({
        email: "novo.convidado@empresa.com",
        role: "manager",
        roleLabel: "Gestor",
        status: "pending",
      });

      const error = await inviteUser({ email: "novo.convidado@empresa.com", role: "user" }).catch(
        (err: unknown) => err
      );
      expect(error).toBeInstanceOf(ApiRequestError);
      expect(error).toMatchObject({ status: 409, code: "ACCOUNT_ALREADY_EXISTS" });
    });

    it("lista os perfis atribuíveis de todas as páginas do catálogo", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(
          mockResponse({
            success: true,
            data: [{ id: 1, name_pt: "Encarregado", name_en: "DPO", type: 1 }],
            meta: { pagination: { current_page: 1, per_page: 100, total: 2, last_page: 2, has_next_page: true } },
          })
        )
        .mockResolvedValueOnce(
          mockResponse({
            success: true,
            data: [{ id: 6, name_pt: "Auditor", name_en: "Auditor", type: 3 }],
            meta: { pagination: { current_page: 2, per_page: 100, total: 2, last_page: 2, has_next_page: false } },
          })
        );

      const profiles = await getAssignableJourneyProfiles();

      expect(requestSpy.mock.calls.map(([config]) => [config.url, config.params])).toEqual([
        ["/journey-profiles", { page: 1, per_page: 100 }],
        ["/journey-profiles", { page: 2, per_page: 100 }],
      ]);
      expect(profiles).toEqual([
        { id: 1, namePt: "Encarregado", nameEn: "DPO", domain: "privacy" },
        { id: 6, namePt: "Auditor", nameEn: "Auditor", domain: "joint" },
      ]);
    });

    it("atribui a jornada com POST /users/{user}/journeys e o token CSRF", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-1" } }))
        .mockResolvedValueOnce(mockResponse({ success: true, data: { id: 90 } }));

      await assignJourneyToUser("7", { profileId: 4 });

      expect(requestSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: "/users/7/journeys",
          method: "post",
          data: { journey_profile_id: 4 },
          headers: expect.objectContaining({ "X-CSRF-TOKEN": "token-1" }),
        })
      );
    });

    it("propaga o 409 de jornada em andamento e o 422 do perfil inicial", async () => {
      vi.spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-1" } }))
        .mockRejectedValueOnce(
          mockAxiosError(409, { success: false, message: "Ja existe", code: "JOURNEY_IN_PROGRESS", errors: [] })
        )
        .mockRejectedValueOnce(
          mockAxiosError(422, {
            success: false,
            message: "Escolha o perfil",
            code: "JOURNEY_PROFILE_SELECTION_REQUIRED",
            errors: [],
          })
        );

      await expect(assignJourneyToUser("7", { profileId: 4 })).rejects.toMatchObject({
        status: 409,
        code: "JOURNEY_IN_PROGRESS",
      });
      await expect(assignJourneyToUser("7", { profileId: 4 })).rejects.toMatchObject({
        status: 422,
        code: "JOURNEY_PROFILE_SELECTION_REQUIRED",
      });
    });

    it("cancela a jornada com POST /journeys/{journey}/cancel e propaga o 403", async () => {
      const requestSpy = vi
        .spyOn(axiosInstance, "request")
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-1" } }))
        .mockResolvedValueOnce(mockResponse({ success: true, data: { id: 90 } }))
        .mockRejectedValueOnce(
          mockAxiosError(403, { success: false, message: "Sem permissao", code: "PERMISSION_DENIED", errors: [] })
        )
        // 403 em requisição com CSRF renova o token e tenta de novo uma vez
        .mockResolvedValueOnce(mockResponse({ success: true, data: { csrf_token: "token-2" } }))
        .mockRejectedValueOnce(
          mockAxiosError(403, { success: false, message: "Sem permissao", code: "PERMISSION_DENIED", errors: [] })
        );

      await cancelAssignedJourney("90");
      expect(requestSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ url: "/journeys/90/cancel", method: "post" })
      );

      await expect(cancelAssignedJourney("90")).rejects.toMatchObject({ status: 403 });
    });
  });
});
