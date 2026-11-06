// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { CheckListIcon, Timer02Icon } from "@hugeicons/core-free-icons";
import { JourneySummaryView } from "../index";
import * as viewModelModule from "../journeySummary.viewmodel";
import type {
  JourneySummaryViewModelReturn,
  JourneySummaryLabels,
} from "../journeySummary.types";
import { AppProviders } from "@/shared/providers";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "pt" }),
}));

vi.mock("@/shared/i18n/navigation", () => ({
  Link: ({
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...rest}>{children}</a>,
  usePathname: () => "/jornada/1",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@shared/i18n/navigation", () => ({
  Link: ({
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...rest}>{children}</a>,
  usePathname: () => "/jornada/1",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("JourneySummaryView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  function renderView() {
    return render(
      <AppProviders>
        <JourneySummaryView journeyId="1" />
      </AppProviders>
    );
  }

  const mockLabels: JourneySummaryLabels = {
    loadingTitle: "Carregando jornada...",
    subtitleStatic: "Confira os detalhes antes de começar.",
    backToJourneysText: "Voltar para jornadas",
    backToJourneysAriaLabel: "Voltar para a listagem de jornadas",
    badgeLabel: "Resumo da jornada",
    domainLabel: "Privacidade",
    lastScoreText: (score) => `Última pontuação ${score}/100`,
    lastScoreAriaLabel: (score) => `Última pontuação: ${score} de 100`,
    durationLabel: "Duração",
    areasLabel: "Áreas",
    competenciesLabel: "Competências",
    durationAriaLabel: (minutes) => `${minutes} minutos de duração`,
    areasAriaLabel: (count) => `${count} áreas`,
    competenciesAriaLabel: (count) => `${count} competências`,
    estimatedMinutesText: (minutes) => `${minutes} min`,
    howItWorksTitle: "Como funciona",
    instructionsIntro: "A seguir, você responderá perguntas sobre privacidade.",
    instructionsAriaLabel: "Instruções do questionário",
    instructionsTip: "Dica: ao concluir, você receberá um resultado detalhado.",
    footerNote: "Suas respostas ficam salvas conforme você avança.",
    dismissLabel: "Agora não",
    dismissAriaLabel: "Voltar para a página anterior",
    notFoundTitle: "Jornada não encontrada",
    notFoundMessage: "Não encontramos a jornada solicitada.",
    serverErrorTitle: "Não foi possível carregar a jornada",
    serverErrorMessage: "Não foi possível completar a busca.",
    backToJourneysLink: "Voltar para a listagem de jornadas",
    loadingAriaLabel: "Carregando resumo da jornada",
    notAvailable: "—",
    notAvailableAriaLabel: (label) => `${label}: não disponível`,
    startingLabel: "Iniciando...",
    startErrorMessage: "Não foi possível iniciar a jornada. Tente novamente.",
    resumeCurrentJourneyLabel: "Continuar jornada atual",
    profileSelectionTitle: "Confirmar o perfil de jornada inicial",
    profileSelectionLockedWarning: "Essa escolha não pode ser alterada depois que você começar.",
    profileSelectionCancel: "Cancelar",
    profileSelectionConfirming: "Iniciando...",
  };

  function createMockVMReturn(
    overrides?: Partial<JourneySummaryViewModelReturn>
  ): JourneySummaryViewModelReturn {
    return {
      journey: {
        id: "1",
        profileId: "1",
        title: "Governança de Dados",
        estimatedMinutes: 23,
        areasCount: 13,
        competenciesCount: 39,
        domain: "privacy",
        status: "not_started",
      },
      lastScore: null,
      instructionItems: [
        { id: "objective", icon: CheckListIcon, title: "Questões objetivas", description: "Uma alternativa por pergunta." },
        { id: "estimatedTime", icon: Timer02Icon, title: "Tempo estimado", description: "Reserve cerca de 23 minutos." },
      ],
      isLoading: false,
      error: null,
      ctaLabel: "Iniciar jornada",
      ctaAriaLabel: "Iniciar jornada — Governança de Dados",
      isStarting: false,
      isCtaDisabled: false,
      startError: null,
      journeyInProgressNotice: null,
      profileSelection: {
        isOpen: false,
        isConfirming: false,
        description: "O perfil de jornada Governança de Dados será o seu perfil de jornada inicial.",
        error: null,
        confirmLabel: "Confirmar e iniciar",
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      },
      initialProfileNotice: null,
      onStartJourney: vi.fn(),
      onResumeCurrentJourney: vi.fn(),
      onDismiss: vi.fn(),
      labels: mockLabels,
      ...overrides,
    };
  }

  it("deve exibir o skeleton de carregamento e ocultar o rodapé de ações", () => {
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({ isLoading: true, journey: null })
    );

    renderView();

    expect(screen.getByTestId("journey-summary-skeleton")).toBeDefined();
    expect(screen.queryByText("Agora não")).toBeNull();
    expect(screen.queryByText("Iniciar jornada")).toBeNull();
  });

  it("deve renderizar o resumo com CTA apontando para a rota resolvida e chamar onDismiss ao clicar em voltar", () => {
    const onDismissMock = vi.fn();
    const vm = createMockVMReturn({
      onDismiss: onDismissMock,
    });
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(vm);

    renderView();

    expect(screen.getAllByText("Governança de Dados").length).toBeGreaterThan(0);
    expect(screen.queryByText("Etapas")).toBeNull();
    expect(screen.getByLabelText("23 minutos de duração")).toBeDefined();
    expect(screen.getByText("Como funciona")).toBeDefined();
    expect(screen.getByText("A seguir, você responderá perguntas sobre privacidade.")).toBeDefined();
    const instructions = screen.getByRole("list", { name: "Instruções do questionário" });
    expect(within(instructions).getAllByRole("listitem")).toHaveLength(2);
    expect(within(instructions).getByText("Reserve cerca de 23 minutos.")).toBeDefined();
    expect(screen.getByText("Dica: ao concluir, você receberá um resultado detalhado.")).toBeDefined();

    fireEvent.click(screen.getByText("Agora não"));
    expect(onDismissMock).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Iniciar jornada — Governança de Dados" }));
    expect(vm.onStartJourney).toHaveBeenCalled();
  });

  it("deve exibir a tag do domínio e, quando houver, a última pontuação", () => {
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(createMockVMReturn());
    const { unmount } = renderView();

    expect(screen.getByText("Privacidade")).toBeDefined();
    expect(screen.queryByLabelText("Última pontuação: 82 de 100")).toBeNull();
    unmount();

    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({ lastScore: 82 })
    );
    renderView();

    expect(screen.getByLabelText("Última pontuação: 82 de 100").textContent).toBe(
      "Última pontuação 82/100"
    );
  });

  it("deve exibir \"—\" nas caixas sem dado (resumo de perfil)", () => {
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({
        journey: {
          ...createMockVMReturn().journey!,
          id: null,
          estimatedMinutes: null,
          areasCount: null,
          competenciesCount: null,
        },
      })
    );

    renderView();

    expect(screen.getByLabelText("Duração: não disponível")).toBeDefined();
    expect(screen.getByLabelText("Competências: não disponível")).toBeDefined();
  });

  it("deve exibir o aviso de jornada em andamento, com retomar, e bloquear o botão principal", () => {
    const onResume = vi.fn();
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({
        journeyInProgressNotice: "Você já possui uma jornada em andamento.",
        isCtaDisabled: true,
        onResumeCurrentJourney: onResume,
      })
    );

    renderView();

    expect(screen.getByRole("status").textContent).toContain(
      "Você já possui uma jornada em andamento."
    );
    const cta = screen.getByRole("button", { name: "Iniciar jornada — Governança de Dados" });
    expect((cta as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Continuar jornada atual" }));
    expect(onResume).toHaveBeenCalled();
  });

  it("deve exibir o diálogo do perfil de jornada inicial e repassar a confirmação", () => {
    const onConfirm = vi.fn();
    const base = createMockVMReturn();
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue({
      ...base,
      profileSelection: { ...base.profileSelection, isOpen: true, onConfirm },
    });

    renderView();

    const dialog = screen.getByRole("alertdialog", { name: "Confirmar o perfil de jornada inicial" });
    expect(within(dialog).getByText(/Governança de Dados será o seu perfil/)).toBeDefined();
    fireEvent.click(within(dialog).getByRole("button", { name: "Confirmar e iniciar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("deve exibir o aviso do perfil inicial com o link para o perfil escolhido", () => {
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({
        isCtaDisabled: true,
        initialProfileNotice: {
          message: "A sua primeira jornada precisa ser do perfil de jornada que você escolheu: Controlador.",
          linkLabel: "Ir para o perfil de jornada escolhido",
          href: "/jornada/perfil/5",
        },
      })
    );

    renderView();

    expect(screen.getByText(/precisa ser do perfil de jornada que você escolheu: Controlador/)).toBeDefined();
    const link = screen.getByRole("link", { name: "Ir para o perfil de jornada escolhido" });
    expect(link.getAttribute("href")).toBe("/jornada/perfil/5");
    const cta = screen.getByRole("button", { name: "Iniciar jornada — Governança de Dados" }) as HTMLButtonElement;
    expect(cta.disabled).toBe(true);
  });

  it("deve exibir falhas ao iniciar como alerta", () => {
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({ startError: "Não foi possível iniciar a jornada. Tente novamente." })
    );

    renderView();

    expect(screen.getByRole("alert").textContent).toContain(
      "Não foi possível iniciar a jornada. Tente novamente."
    );
  });

  it("deve indicar o início em andamento no botão principal", () => {
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({ isStarting: true, isCtaDisabled: true })
    );

    renderView();

    const cta = screen.getByText("Iniciando...").closest("button");
    expect(cta?.disabled).toBe(true);
  });

  it("deve exibir o estado de não encontrado substituindo o conteúdo, com link de volta para /jornadas", () => {
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({ journey: null, error: "not_found" })
    );

    renderView();

    const errorState = screen.getByTestId("journey-summary-error-state");
    expect(errorState).toBeDefined();
    expect(within(errorState).getByText("Jornada não encontrada")).toBeDefined();
    const backLink = within(errorState).getByText("Voltar para a listagem de jornadas");
    expect(backLink.closest("a")?.getAttribute("href")).toBe("/jornadas");
  });

  it("deve exibir o estado de erro de servidor substituindo o conteúdo, com link de volta para /jornadas", () => {
    vi.spyOn(viewModelModule, "useJourneySummaryVM").mockReturnValue(
      createMockVMReturn({ journey: null, error: "server_error" })
    );

    renderView();

    const errorState = screen.getByTestId("journey-summary-error-state");
    expect(errorState).toBeDefined();
    expect(
      within(errorState).getByText("Não foi possível carregar a jornada")
    ).toBeDefined();
    const backLink = within(errorState).getByText("Voltar para a listagem de jornadas");
    expect(backLink.closest("a")?.getAttribute("href")).toBe("/jornadas");
  });
});
