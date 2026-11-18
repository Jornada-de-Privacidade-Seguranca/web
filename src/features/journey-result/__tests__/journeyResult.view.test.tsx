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
  areas: {
    eyebrow: "Detalhamento por área de conhecimento",
    title: "Conhecimentos adquiridos",
    recommendation: "Recomenda-se no mínimo 60% de conhecimento na área.",
    markerAriaLabel: "Mínimo recomendado: 60",
  },
  competencies: {
    eyebrow: "Respostas do questionário",
    declaredTitle: "Competências declaradas",
    undeclaredTitle: "Competências não declaradas",
    emptyGroup: "Nenhuma competência neste grupo.",
    difficultyPrefix: "Nível",
    domainPrefix: "Domínio",
  },
  pdf: { downloadButton: "Baixar PDF", generatingLabel: "Gerando PDF…" },
  errors: null,
};

const weak = { value: 50, band: "weak", bandLabel: "A desenvolver" } as const;

function buildVM(overrides: Partial<JourneyResultViewModelReturn> = {}): JourneyResultViewModelReturn {
  return {
    person: null,
    journeyTitle: "Encarregado de Dados",
    score: { value: 76, band: "strong", bandLabel: "Forte" },
    declaredCount: 2,
    totalCompetencies: 4,
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
    canDownloadPdf: true,
    isDownloadingPdf: false,
    pdfError: null,
    handleDownloadPdf: vi.fn(),
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

  it("não deve exibir a pontuação por categoria nem os dados do pré-questionário", () => {
    mockVM();
    render(<JourneyResultView journeyId="10" />);

    expect(screen.queryByTestId("category-score-list")).toBeNull();
    expect(screen.queryByTestId("professional-profile-summary")).toBeNull();
    expect(screen.queryByText(/pré-questionário/i)).toBeNull();
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

    const button = screen.getByRole("button", { name: "Conhecimentos adquiridos" });
    const region = document.getElementById(button.getAttribute("aria-controls") ?? "");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(region?.getAttribute("role")).toBe("region");
    expect(region?.hidden).toBe(false);

    fireEvent.click(button);

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(region?.hidden).toBe(true);
  });

  it("deve permitir recolher todas as seções, exceto a nota geral", () => {
    mockVM();
    render(<JourneyResultView journeyId="10" />);

    const card = screen.getByTestId("score-summary-card");
    // O card não é recolhível: nenhum botão dele abre ou fecha conteúdo
    expect(card.querySelector("button[aria-expanded]")).toBeNull();
    for (const title of [
      "Conhecimentos adquiridos",
      "Competências declaradas",
      "Competências não declaradas",
    ]) {
      expect(screen.getByRole("button", { name: title }).getAttribute("aria-expanded")).toBe("true");
    }
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

  it("deve oferecer o download do PDF entre refazer e voltar", () => {
    const vm = mockVM();
    render(<JourneyResultView journeyId="10" />);

    const card = screen.getByTestId("score-summary-card");
    const button = within(card).getByRole("button", { name: "Baixar PDF" });
    const actions = Array.from(card.querySelectorAll("a, button")).map((el) => el.textContent?.trim());
    expect(actions.indexOf("Baixar PDF")).toBeGreaterThan(actions.indexOf("Refazer questionário"));
    expect(actions.indexOf("Baixar PDF")).toBeLessThan(actions.indexOf("Voltar"));

    fireEvent.click(button);
    expect(vm.handleDownloadPdf).toHaveBeenCalled();
  });

  it("deve desabilitar o botão e indicar o carregamento durante o download", () => {
    mockVM({ isDownloadingPdf: true });
    render(<JourneyResultView journeyId="10" />);

    const button = screen.getByRole("button", { name: "Gerando PDF…" });
    expect(button).toHaveProperty("disabled", true);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });

  it("deve anunciar a falha no download ao lado do botão", () => {
    mockVM({ pdfError: "Não foi possível gerar o PDF. Tente novamente." });
    render(<JourneyResultView journeyId="10" />);

    const alert = screen.getByTestId("pdf-error");
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert.textContent).toBe("Não foi possível gerar o PDF. Tente novamente.");
    expect(screen.getByRole("button", { name: "Baixar PDF" })).toHaveProperty("disabled", false);
  });

  it("não deve exibir o botão de PDF quando o download não estiver disponível", () => {
    mockVM({ canDownloadPdf: false });
    render(<JourneyResultView journeyId="10" />);

    expect(screen.queryByRole("button", { name: "Baixar PDF" })).toBeNull();
  });

  it("deve identificar a pessoa e esconder o refazer na visão do admin", () => {
    mockVM({
      retakeUrl: null,
      resultsUrl: "/admin/resultados?department=TI",
      person: {
        ariaLabel: "Dados do usuário avaliado",
        initials: "AS",
        name: "Ana Beatriz Silva",
        email: "ana@empresa.gov.br",
        fields: [
          { id: "organization", label: "Órgão/Empresa", value: "Ministério X" },
          { id: "sector", label: "Setor", value: "Jurídico" },
          { id: "registration", label: "Matrícula", value: "Não informado" },
        ],
      },
    });
    render(<JourneyResultView journeyId="10" variant="admin" listQuery="department=TI" />);

    expect(viewModelModule.useJourneyResultVM).toHaveBeenCalledWith("10", {
      variant: "admin",
      listQuery: "department=TI",
    });
    const person = screen.getByRole("region", { name: "Dados do usuário avaliado" });
    expect(within(person).getByText("AS")).toBeTruthy();
    expect(within(person).getByText("Ana Beatriz Silva")).toBeTruthy();
    expect(within(person).getByText("ana@empresa.gov.br")).toBeTruthy();
    expect(within(person).getByText("Órgão/Empresa").nextElementSibling?.textContent).toBe("Ministério X");
    expect(within(person).getByText("Setor").nextElementSibling?.textContent).toBe("Jurídico");
    expect(within(person).getByText("Matrícula").nextElementSibling?.textContent).toBe("Não informado");

    const card = screen.getByTestId("score-summary-card");
    expect(within(card).queryByText("Refazer questionário")).toBeNull();
    expect(within(card).getByText("Voltar").closest("a")?.getAttribute("href")).toBe(
      "/admin/resultados?department=TI"
    );
    // O bloco da pessoa vem antes da nota geral
    expect(person.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("não deve exibir o bloco da pessoa no resultado da própria pessoa", () => {
    mockVM();
    render(<JourneyResultView journeyId="10" />);

    expect(screen.queryByTestId("result-person-card")).toBeNull();
  });
});
