// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import React from "react";
import { AdminResultsView } from "../index";
import * as viewModelModule from "../adminResults.viewmodel";
import type { AdminResultsLabels, AdminResultsViewModelReturn } from "../adminResults.types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "pt",
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    "aria-label"?: string;
  }) => (
    <a href={href} aria-label={ariaLabel}>
      {children}
    </a>
  ),
  usePathname: () => "/admin/resultados",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/components/layout/PageShell", () => ({
  PageShell: ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  ),
}));

const mockLabels: AdminResultsLabels = {
  title: "Resultados dos Usuários",
  subtitle: "Acompanhe as jornadas concluídas.",
  summaryAriaLabel: "Resumo dos resultados",
  summaryTotalCompleted: "Jornadas concluídas",
  summaryTotalUsers: "Usuários avaliados",
  summaryDomainScore: (score) => `${score}/100`,
  summaryEmptyScore: "—",
  filtersAriaLabel: "Filtros avançados",
  searchPlaceholder: "Buscar por usuário, e-mail ou perfil...",
  filterUser: "Usuário",
  filterAllUsers: "Todos os usuários",
  filterDepartment: "Setor",
  filterAllDepartments: "Todos os setores",
  filterProfile: "Perfil de jornada",
  filterAllProfiles: "Todos os perfis de jornada",
  filterDomains: "Domínios",
  filterDateFrom: "Concluídas a partir de",
  filterDateTo: "Concluídas até",
  filterClear: "Limpar filtros",
  filterCounter: (filtered, total) => `${filtered} de ${total} resultados`,
  tableUser: "Usuário",
  tableDepartment: "Setor",
  tableProfile: "Perfil de jornada",
  tableDomain: "Domínio",
  tableCompletedAt: "Data de conclusão",
  tableScore: "Nota",
  tableActions: "Ações",
  tableView: "Ver",
  tableEmptyDepartment: "—",
  scoreValue: (score) => `${score}/100`,
  scoreBandLabel: (band) => band,
  scoreAriaLabel: (score, band) => `Nota ${score} de 100, nível ${band}`,
  formatDate: () => "08/06/2026",
  emptyTitle: "Nenhum resultado encontrado",
  emptyDescription: "Nenhum resultado corresponde aos filtros aplicados.",
  emptyNoDataTitle: "Ainda não há resultados concluídos",
  emptyNoDataDescription: "Quando os colaboradores concluírem suas jornadas, os resultados aparecerão aqui.",
  emptyClearButton: "Limpar filtros",
  paginationPrevious: "Anterior",
  paginationNext: "Próxima",
  paginationPageOf: (current, total) => `Página ${current} de ${total}`,
  errorTitle: "Erro ao carregar resultados",
  errorMessage: "Não foi possível carregar os resultados.",
  retryButton: "Tentar novamente",
  loadingAriaLabel: "Carregando resultados dos usuários",
};

function createMockVM(
  overrides?: Partial<AdminResultsViewModelReturn>
): AdminResultsViewModelReturn {
  return {
    summary: {
      totalCompletedJourneys: 14,
      totalEvaluatedUsers: 6,
      domainAverages: [
        {
          domain: "privacy",
          namePt: "Privacidade",
          nameEn: "Privacy",
          label: "Privacidade",
          averageScore: 82,
          completedCount: 5,
        },
        {
          domain: "security",
          namePt: "Segurança da Informação",
          nameEn: "Information Security",
          label: "Segurança da Informação",
          averageScore: 79,
          completedCount: 6,
        },
        {
          domain: "joint",
          namePt: "Conjunta",
          nameEn: "Joint",
          label: "Conjunta",
          averageScore: null,
          completedCount: 0,
        },
      ],
    },
    results: [
      {
        id: "ar-1",
        journeyId: "101",
        user: {
          id: "1",
          name: "Ana Beatriz Silva",
          email: "ana.silva@empresa.com",
          initials: "AS",
          department: "Tecnologia da Informação",
        },
        profileId: "1",
        profileTitle: "Encarregado pelo Tratamento de Dados Pessoais",
        profileNamePt: "Encarregado pelo Tratamento de Dados Pessoais",
        profileNameEn: "Data Protection Officer (DPO)",
        domain: "privacy",
        domainNamePt: "Privacidade",
        domainNameEn: "Privacy",
        domainLabel: "Privacidade",
        completedAt: "2026-06-08T14:20:00Z",
        score: 90,
        scoreBand: "strong",
      },
      {
        id: "ar-2",
        journeyId: "102",
        user: {
          id: "3",
          name: "Mariana Oliveira",
          email: "mariana@empresa.com",
          initials: "MO",
          department: "Recursos Humanos",
        },
        profileId: "5",
        profileTitle: "Membro de Equipe de Resposta a Incidentes",
        profileNamePt: "Membro de Equipe de Resposta a Incidentes",
        profileNameEn: "Incident Response Team Member",
        domain: "security",
        domainNamePt: "Segurança da Informação",
        domainNameEn: "Information Security",
        domainLabel: "Segurança da Informação",
        completedAt: "2026-05-19T09:00:00Z",
        score: 58,
        scoreBand: "weak",
      },
    ],
    totalResults: 14,
    filteredTotal: 2,
    page: 1,
    totalPages: 3,
    isLoading: false,
    isError: false,
    errorMessage: null,
    hasActiveFilters: false,
    filters: {
      search: "",
      userId: "",
      department: "",
      domains: [],
      journeyProfileId: "",
      dateFrom: "",
      dateTo: "",
    },
    filterOptions: {
      users: [{ id: "1", name: "Ana Beatriz Silva", email: "ana.silva@empresa.com" }],
      departments: ["Tecnologia da Informação"],
      domains: [
        { id: "privacy", namePt: "Privacidade", nameEn: "Privacy", label: "Privacidade" },
        { id: "security", namePt: "Segurança da Informação", nameEn: "Information Security", label: "Segurança da Informação" },
      ],
      journeyProfiles: [
        {
          id: "1",
          namePt: "Encarregado pelo Tratamento de Dados Pessoais",
          nameEn: "Data Protection Officer (DPO)",
          label: "Encarregado pelo Tratamento de Dados Pessoais",
        },
      ],
    },
    handleSearchChange: vi.fn(),
    handleUserChange: vi.fn(),
    handleDepartmentChange: vi.fn(),
    handleToggleDomain: vi.fn(),
    handleProfileChange: vi.fn(),
    handleDateFromChange: vi.fn(),
    handleDateToChange: vi.fn(),
    handleClearFilters: vi.fn(),
    handlePageChange: vi.fn(),
    handleRetry: vi.fn(),
    labels: mockLabels,
    ...overrides,
  };
}

describe("AdminResultsView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("deve exibir blocos de resumo por domínio (com '—' quando vazio) e sem média geral", () => {
    vi.spyOn(viewModelModule, "useAdminResultsVM").mockReturnValue(createMockVM());

    render(<AdminResultsView />);

    const summary = screen.getByTestId("admin-results-summary");
    expect(within(summary).getByText("Jornadas concluídas")).toBeDefined();
    expect(within(summary).getByText("14")).toBeDefined();
    expect(within(summary).getByText("Usuários avaliados")).toBeDefined();
    expect(within(summary).getByText("6")).toBeDefined();
    expect(within(summary).getByText("82/100")).toBeDefined();
    expect(within(summary).getByText("79/100")).toBeDefined();
    expect(within(summary).getByText("—")).toBeDefined();
    expect(within(summary).queryByText(/Média geral/i)).toBeNull();
  });

  it("deve renderizar tabela com usuário, setor, perfil, domínio, nota por faixa e botão 'Ver'", () => {
    vi.spyOn(viewModelModule, "useAdminResultsVM").mockReturnValue(createMockVM());

    render(<AdminResultsView />);

    const table = screen.getByRole("table");
    expect(within(table).getByText("AS")).toBeDefined();
    expect(within(table).getByText("Ana Beatriz Silva")).toBeDefined();
    expect(within(table).getByText("ana.silva@empresa.com")).toBeDefined();
    expect(within(table).getByText("Tecnologia da Informação")).toBeDefined();

    const strongBadge = within(table).getByText("90/100");
    expect(strongBadge.className).toContain("emerald");

    const weakBadge = within(table).getByText("58/100");
    expect(weakBadge.className).toContain("destructive");

    const viewLink = within(table).getByRole("link", {
      name: /Ver — Ana Beatriz Silva/i,
    });
    expect(viewLink.getAttribute("href")).toBe("/jornada/101/resultado");

    expect(screen.getByText("2 de 14 resultados")).toBeDefined();
    expect(screen.getByText("Página 1 de 3")).toBeDefined();
  });

  it("deve acionar filtros avançados, período e paginação", () => {
    const vm = createMockVM({ hasActiveFilters: true });
    vi.spyOn(viewModelModule, "useAdminResultsVM").mockReturnValue(vm);

    render(<AdminResultsView />);

    fireEvent.change(screen.getByPlaceholderText("Buscar por usuário, e-mail ou perfil..."), {
      target: { value: "ana" },
    });
    expect(vm.handleSearchChange).toHaveBeenCalledWith("ana");

    fireEvent.change(screen.getByLabelText("Usuário"), { target: { value: "1" } });
    expect(vm.handleUserChange).toHaveBeenCalledWith("1");

    fireEvent.change(screen.getByLabelText("Setor"), {
      target: { value: "Tecnologia da Informação" },
    });
    expect(vm.handleDepartmentChange).toHaveBeenCalledWith("Tecnologia da Informação");

    fireEvent.change(screen.getByLabelText("Perfil de jornada"), { target: { value: "1" } });
    expect(vm.handleProfileChange).toHaveBeenCalledWith("1");

    fireEvent.click(screen.getByRole("button", { name: "Privacidade" }));
    expect(vm.handleToggleDomain).toHaveBeenCalledWith("privacy");

    fireEvent.change(screen.getByLabelText("Concluídas a partir de"), {
      target: { value: "2026-05-01" },
    });
    expect(vm.handleDateFromChange).toHaveBeenCalledWith("2026-05-01");

    fireEvent.change(screen.getByLabelText("Concluídas até"), {
      target: { value: "2026-05-31" },
    });
    expect(vm.handleDateToChange).toHaveBeenCalledWith("2026-05-31");

    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(vm.handleClearFilters).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(vm.handlePageChange).toHaveBeenCalledWith(2);
  });

  it("deve exibir estado vazio com ação de limpar filtros quando nenhum resultado corresponder", () => {
    const vm = createMockVM({
      results: [],
      filteredTotal: 0,
      totalPages: 1,
      hasActiveFilters: true,
    });
    vi.spyOn(viewModelModule, "useAdminResultsVM").mockReturnValue(vm);

    render(<AdminResultsView />);

    const empty = screen.getByTestId("admin-results-empty-state");
    expect(within(empty).getByText("Nenhum resultado encontrado")).toBeDefined();
    fireEvent.click(within(empty).getByRole("button", { name: "Limpar filtros" }));
    expect(vm.handleClearFilters).toHaveBeenCalled();
  });

  it("deve exibir estado de carregamento e estado de erro com nova tentativa", () => {
    vi.spyOn(viewModelModule, "useAdminResultsVM").mockReturnValue(
      createMockVM({ isLoading: true })
    );
    const { rerender } = render(<AdminResultsView />);
    expect(screen.getByTestId("admin-results-skeleton")).toBeDefined();

    const handleRetry = vi.fn();
    vi.spyOn(viewModelModule, "useAdminResultsVM").mockReturnValue(
      createMockVM({
        isLoading: false,
        isError: true,
        errorMessage: "Não foi possível carregar os resultados.",
        handleRetry,
      })
    );
    rerender(<AdminResultsView />);
    expect(screen.getByRole("alert").textContent).toContain(
      "Não foi possível carregar os resultados."
    );
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

