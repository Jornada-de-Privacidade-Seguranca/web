// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { JourneyResultView } from "../index";
import * as viewModelModule from "../journeyResult.viewmodel";
import type {
  JourneyResultLabels,
  JourneyResultViewModelReturn,
} from "../journeyResult.types";

vi.mock("@shared/i18n/navigation", () => ({
  Link: ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...rest}>{children}</a>
  ),
}));

// O cabeçalho da página tem seletores de tema e idioma, fora do escopo da tela
vi.mock("@components/layout/PageShell", () => ({
  PageShell: ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p data-testid="page-subtitle">{subtitle}</p>}
      <main>{children}</main>
    </div>
  ),
}));

const labels: JourneyResultLabels = {
  pageTitle: "Seu perfil de conhecimento",
  loadingAriaLabel: "Carregando o resultado da jornada",
  overallLabel: "Nota geral",
  overallScoreAriaLabel: "Nota geral: Forte, 76 de 100",
  declaredCountText: "2 de 4 competências declaradas",
  retakeButton: "Refazer questionário",
  backButton: "Voltar",
  categories: { eyebrow: "Pontuação ponderada", title: "Pontuação por Categoria" },
  areas: {
    eyebrow: "Detalhamento por área de conhecimento",
    title: "Conhecimentos adquiridos",
    recommendation: "Recomenda-se no mínimo 60% de conhecimento na área.",
    markerAriaLabel: "Mínimo recomendado: 60",
  },
  profile: {
    eyebrow: "Perfil profissional",
    title: "Dados informados no pré-questionário",
    coursesTitle: "Formação acadêmica",
    certificationsTitle: "Certificações profissionais",
    noCourses: "Nenhum curso informado",
    noCertifications: "Nenhuma certificação informada",
  },
  competencies: {
    eyebrow: "Respostas do questionário",
    declaredTitle: "Competências declaradas",
    undeclaredTitle: "Competências não declaradas",
    emptyGroup: "Nenhuma competência neste grupo.",
    difficultyPrefix: "Nível",
    domainPrefix: "Domínio",
  },
  errors: null,
};

const strong = { value: 100, band: "strong", bandLabel: "Forte" } as const;
const weak = { value: 50, band: "weak", bandLabel: "A desenvolver" } as const;

function buildVM(overrides: Partial<JourneyResultViewModelReturn> = {}): JourneyResultViewModelReturn {
  return {
    journeyTitle: "Encarregado de Dados",
    score: { value: 76, band: "strong", bandLabel: "Forte" },
    declaredCount: 2,
    totalCompetencies: 4,
    categoryScores: null,
    isJointJourney: false,
    areaScoreGroups: [
      {
        id: "all",
        title: null,
        areas: [
          {
            id: "1",
            name: "Governança",
            score: weak,
            scoreAriaLabel: "Governança: A desenvolver, 50 de 100",
            declaredCount: 1,
            totalCount: 2,
            countText: "1 de 2 competências",
          },
        ],
      },
    ],
    professionalProfile: {
      fields: [
        { id: "professional_experience", label: "Tempo de experiência profissional", value: "Entre 1 e 3 anos" },
        { id: "english_proficiency", label: "Nível de proficiência em inglês", value: "Não informado" },
        { id: "profile_experience", label: "Tempo de atuação no perfil", value: "Entre 4 e 6 anos" },
      ],
      courseGroups: [],
      certifications: [{ id: 1, name: "CIPP/E" }],
    },
    declaredCompetencies: [
      {
        id: "1",
        name: "Governança",
        countText: "1 competência",
        competencies: [
          {
            id: 1,
            name: "Mapeamento de dados",
            description: "Descrição",
            difficulty: { level: "basic", label: "Básico" },
            domain: "Privacidade",
          },
        ],
      },
    ],
    undeclaredCompetencies: [],
    retakeUrl: "/jornada/10",
    resultsUrl: "/resultados",
    recommendedAreaScore: 60,
    isLoading: false,
    error: null,
    labels,
    handleRetry: vi.fn(),
    ...overrides,
  };
}

function mockVM(overrides: Partial<JourneyResultViewModelReturn> = {}) {
  const vm = buildVM(overrides);
  vi.spyOn(viewModelModule, "useJourneyResultVM").mockReturnValue(vm);
  return vm;
}

describe("JourneyResultView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve exibir o skeleton com a região de carregamento ocupada", () => {
    mockVM({ isLoading: true });
    render(<JourneyResultView journeyId="10" />);

    const content = screen.getByTestId("journey-result-content");
    expect(content.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByTestId("journey-result-skeleton").getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByTestId("score-summary-card")).toBeNull();
  });

  it("deve exibir o card da nota geral com as ações", () => {
    mockVM();
    render(<JourneyResultView journeyId="10" />);

    expect(screen.getByTestId("page-subtitle").textContent).toBe("Encarregado de Dados");
    const card = screen.getByTestId("score-summary-card");
    expect(within(card).getByRole("heading", { level: 2, name: "Encarregado de Dados" })).toBeTruthy();
    expect(
      within(card).getByRole("progressbar", { name: "Nota geral: Forte, 76 de 100" })
    ).toBeTruthy();
    expect(within(card).getByText("Forte 76/100")).toBeTruthy();
    expect(within(card).getByText("2 de 4 competências declaradas")).toBeTruthy();
    expect(within(card).getByText("Refazer questionário").closest("a")?.getAttribute("href")).toBe(
      "/jornada/10"
    );
    expect(within(card).getByText("Voltar").closest("a")?.getAttribute("href")).toBe("/resultados");
  });

  it("deve ocultar a pontuação por categoria enquanto o backend não a retornar", () => {
    mockVM({ categoryScores: null });
    render(<JourneyResultView journeyId="10" />);

    expect(screen.queryByTestId("category-score-list")).toBeNull();
  });

  it("deve exibir a pontuação por categoria quando retornada", () => {
    mockVM({
      categoryScores: [
        { id: "english", name: "Inglês", score: strong, scoreAriaLabel: "Inglês: Forte, 100 de 100" },
      ],
    });
    render(<JourneyResultView journeyId="10" />);

    const section = screen.getByTestId("category-score-list");
    expect(within(section).getByRole("progressbar", { name: "Inglês: Forte, 100 de 100" })).toBeTruthy();
  });

  it("deve exibir a barra de cada área com o mínimo recomendado", () => {
    mockVM();
    render(<JourneyResultView journeyId="10" />);

    const card = screen.getAllByTestId("area-score-card")[0];
    const bar = within(card).getByRole("progressbar", {
      name: "Governança: A desenvolver, 50 de 100",
    });
    const descriptionId = bar.getAttribute("aria-describedby");
    expect(descriptionId && document.getElementById(descriptionId)?.textContent).toBe(
      "Mínimo recomendado: 60"
    );
    expect(within(card).getByTestId("score-bar-marker").style.left).toBe("60%");
    expect(within(card).getByText("1 de 2 competências")).toBeTruthy();
  });

  it("deve dividir as áreas em blocos por domínio em jornadas conjuntas", () => {
    mockVM({
      isJointJourney: true,
      areaScoreGroups: [
        { id: "1", title: "Privacidade", areas: [] },
        { id: "2", title: "Segurança da Informação", areas: [] },
      ],
    });
    render(<JourneyResultView journeyId="10" />);

    const section = screen.getByTestId("area-score-section");
    expect(within(section).getByRole("button", { name: "Privacidade" })).toBeTruthy();
    expect(within(section).getByRole("button", { name: "Segurança da Informação" })).toBeTruthy();
  });

  it("deve recolher e abrir uma seção pelo botão do título", () => {
    mockVM();
    render(<JourneyResultView journeyId="10" />);

    const button = screen.getByRole("button", { name: "Dados informados no pré-questionário" });
    const region = document.getElementById(button.getAttribute("aria-controls") ?? "");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(region?.getAttribute("role")).toBe("region");
    expect(region?.hidden).toBe(false);

    fireEvent.click(button);

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(region?.hidden).toBe(true);
  });

  it("deve exibir o perfil profissional e as listas vazias", () => {
    mockVM();
    render(<JourneyResultView journeyId="10" />);

    const section = screen.getByTestId("professional-profile-summary");
    expect(within(section).getByText("Não informado")).toBeTruthy();
    expect(within(section).getByText("Nenhum curso informado")).toBeTruthy();
    expect(within(section).getByText("CIPP/E")).toBeTruthy();
  });

  it("deve iniciar as áreas das caixas de competências recolhidas", () => {
    mockVM();
    render(<JourneyResultView journeyId="10" />);

    const box = screen.getByTestId("competency-box-declared");
    const areaButton = within(box).getByRole("button", { name: "Governança · 1 competência" });
    expect(areaButton.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(areaButton);

    expect(within(box).getByText("Mapeamento de dados")).toBeTruthy();
    expect(within(box).getByTestId("difficulty-badge").textContent).toBe("Nível: Básico");
    expect(within(box).getByTestId("domain-badge").textContent).toBe("Domínio: Privacidade");
    expect(within(screen.getByTestId("competency-box-undeclared")).getByText("Nenhuma competência neste grupo.")).toBeTruthy();
  });

  it("deve substituir o conteúdo pela mensagem de erro, com nova tentativa", () => {
    const vm = mockVM({
      error: "server_error",
      labels: {
        ...labels,
        errors: {
          title: "Erro ao carregar o resultado",
          message: "Tente novamente.",
          linkText: "Voltar para Resultados",
          linkHref: "/resultados",
          retryButton: "Tentar novamente",
        },
      },
    });
    render(<JourneyResultView journeyId="10" />);

    expect(screen.queryByTestId("journey-result-content")).toBeNull();
    expect(screen.queryByTestId("page-subtitle")).toBeNull();
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Erro ao carregar o resultado")).toBeTruthy();
    expect(within(alert).getByText("Voltar para Resultados").closest("a")?.getAttribute("href")).toBe(
      "/resultados"
    );

    fireEvent.click(within(alert).getByRole("button", { name: "Tentar novamente" }));
    expect(vm.handleRetry).toHaveBeenCalled();
  });

  it("não deve oferecer nova tentativa para erros que não se resolvem tentando de novo", () => {
    mockVM({
      error: "not_completed",
      labels: {
        ...labels,
        errors: {
          title: "Jornada em andamento",
          message: "Conclua o questionário.",
          linkText: "Ir para o resumo da jornada",
          linkHref: "/jornada/10",
          retryButton: null,
        },
      },
    });
    render(<JourneyResultView journeyId="10" />);

    const alert = screen.getByRole("alert");
    expect(within(alert).queryByRole("button")).toBeNull();
    expect(
      within(alert).getByText("Ir para o resumo da jornada").closest("a")?.getAttribute("href")
    ).toBe("/jornada/10");
  });
});
