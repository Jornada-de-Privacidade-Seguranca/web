import { describe, it, expect, vi } from "vitest";
import { useAdminResultsFiltersVM } from "../adminResultsFilters.viewmodel";

describe("useAdminResultsFiltersVM", () => {
  it("deve marcar domínios selecionados e formatar o contador", () => {
    const vm = useAdminResultsFiltersVM({
      filters: {
        search: "",
        userId: "1",
        department: "",
        domains: ["privacy", "joint"],
        journeyProfileId: "",
        dateFrom: "",
        dateTo: "",
      },
      filterOptions: {
        users: [{ id: "1", name: "Ana", email: "ana@empresa.com" }],
        departments: ["TI"],
        domains: [
          { id: "privacy", namePt: "Privacidade", nameEn: "Privacy", label: "Privacidade" },
          {
            id: "security",
            namePt: "Segurança da Informação",
            nameEn: "Information Security",
            label: "Segurança da Informação",
          },
          { id: "joint", namePt: "Conjunta", nameEn: "Joint", label: "Conjunta" },
        ],
        journeyProfiles: [],
      },
      filteredTotal: 3,
      totalResults: 14,
      hasActiveFilters: true,
      onSearchChange: vi.fn(),
      onUserChange: vi.fn(),
      onDepartmentChange: vi.fn(),
      onToggleDomain: vi.fn(),
      onProfileChange: vi.fn(),
      onDateFromChange: vi.fn(),
      onDateToChange: vi.fn(),
      onClearFilters: vi.fn(),
      labels: {
        filtersAriaLabel: "Filtros",
        searchPlaceholder: "Buscar...",
        filterUser: "Usuário",
        filterAllUsers: "Todos",
        filterDepartment: "Setor",
        filterAllDepartments: "Todos",
        filterProfile: "Perfil",
        filterAllProfiles: "Todos",
        filterDomains: "Domínios",
        filterDateFrom: "De",
        filterDateTo: "Até",
        filterClear: "Limpar filtros",
        filterCounter: (f, t) => `${f} de ${t} resultados`,
      },
    });

    expect(vm.counterText).toBe("3 de 14 resultados");
    expect(vm.domainOptions).toEqual([
      { id: "privacy", label: "Privacidade", isSelected: true },
      { id: "security", label: "Segurança da Informação", isSelected: false },
      { id: "joint", label: "Conjunta", isSelected: true },
    ]);
  });
});

