// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { CertificationsStepView } from "../index";
import * as viewModelModule from "../certificationsStep.viewmodel";
import type { CertificationsStepViewModelReturn } from "../certificationsStep.types";

vi.mock("@shared/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  Link: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function createVM(
  overrides?: Partial<CertificationsStepViewModelReturn>
): CertificationsStepViewModelReturn {
  return {
    journeyTitle: "Encarregado de Dados",
    groups: [
      { id: "1", label: "Privacidade" },
      { id: "2", label: "Segurança da Informação" },
      { id: "other", label: "Outras" },
    ],
    activeGroupId: "1",
    visibleCertifications: [{ id: "10", label: "CIPP/E", groupId: "1" }],
    selectedCertifications: [],
    searchTerm: "",
    maxSelectable: 100,
    isLimitReached: false,
    isLoading: false,
    isSubmitting: false,
    isContinueDisabled: false,
    error: null,
    isJourneyNotFound: false,
    isExitModalOpen: false,
    journeysHref: "/jornadas",
    labels: {
      stepTag: "PRÉ-QUESTIONÁRIO · CERTIFICAÇÕES PROFISSIONAIS",
      title: "Certificações profissionais",
      description: "Selecione uma ou mais certificações que fazem parte do seu currículo.",
      searchPlaceholder: "Pesquisar certificação...",
      searchAriaLabel: "Pesquisar certificação",
      groupsAriaLabel: "Domínios de conhecimento",
      emptyLabel: "Nenhuma certificação encontrada.",
      counterLabel: "0 certificação(ões) selecionada(s)",
      limitReachedLabel: "Você atingiu o limite de 100 certificações selecionadas.",
      removeCertificationAriaLabel: (certification) => `Remover ${certification}`,
      backLabel: "Voltar",
      backAriaLabel: "Voltar para a etapa anterior",
      continueLabel: "Continuar",
      savingLabel: "Salvando...",
      exitLabel: "Sair",
      exitAriaLabel: "Sair do pré-questionário",
      exitModal: {
        title: "Deseja sair do pré-questionário?",
        description: "Suas respostas anteriores já foram salvas.",
        cancelButton: "Continuar respondendo",
        confirmButton: "Sair da jornada",
      },
      loadingText: "Carregando pergunta...",
      retryButton: "Tentar novamente",
      noOngoingJourneyTitle: "Nenhuma jornada em andamento",
      noOngoingJourneyMessage: "Não encontramos uma jornada em andamento.",
      backToJourneysLink: "Voltar para jornadas",
    },
    handleSearchChange: vi.fn(),
    handleGroupChange: vi.fn(),
    handleToggleCertification: vi.fn(),
    handleRemoveCertification: vi.fn(),
    handleContinue: vi.fn(),
    handleBack: vi.fn(),
    handleExit: vi.fn(),
    handleCancelExit: vi.fn(),
    handleConfirmExit: vi.fn(),
    handleRetry: vi.fn(),
    ...overrides,
  };
}

describe("CertificationsStepView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it("deve exibir o skeleton durante o carregamento", () => {
    vi.spyOn(viewModelModule, "useCertificationsStepVM").mockReturnValue(
      createVM({ isLoading: true })
    );
    render(<CertificationsStepView />);

    expect(screen.getByTestId("certifications-step-skeleton")).toBeDefined();
  });

  it("deve exibir o estado sem jornada em andamento com link para /jornadas", () => {
    vi.spyOn(viewModelModule, "useCertificationsStepVM").mockReturnValue(
      createVM({ isJourneyNotFound: true })
    );
    render(<CertificationsStepView />);

    expect(screen.getByText("Nenhuma jornada em andamento")).toBeDefined();
    expect(screen.getByText("Voltar para jornadas").closest("a")?.getAttribute("href")).toBe(
      "/jornadas"
    );
  });

  it("deve renderizar cabeçalho, abas por domínio e certificações", () => {
    vi.spyOn(viewModelModule, "useCertificationsStepVM").mockReturnValue(createVM());
    render(<CertificationsStepView />);

    expect(screen.getByText("PRÉ-QUESTIONÁRIO · CERTIFICAÇÕES PROFISSIONAIS")).toBeDefined();
    expect(screen.getByText("Encarregado de Dados")).toBeDefined();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Privacidade",
      "Segurança da Informação",
      "Outras",
    ]);
    expect(screen.getByRole("checkbox", { name: /CIPP\/E/ })).toBeDefined();
    expect(screen.queryByText(/limite de 100/)).toBeNull();
  });

  it("deve exibir o aviso de limite quando a seleção alcançar o máximo", () => {
    vi.spyOn(viewModelModule, "useCertificationsStepVM").mockReturnValue(
      createVM({
        selectedCertifications: [{ id: "10", label: "CIPP/E", groupId: "1" }],
        maxSelectable: 1,
        isLimitReached: true,
      })
    );
    render(<CertificationsStepView />);

    expect(screen.getByRole("status").textContent).toBe(
      "Você atingiu o limite de 100 certificações selecionadas."
    );
  });
});
