// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { Mortarboard02Icon } from "@hugeicons/core-free-icons";
import { MultiSelectSearchStep } from "../index";
import type { MultiSelectSearchStepProps } from "../multiSelectSearchStep.types";

// MultiSelectSearchStep está deprecado (sem uso nas telas), mas segue coberto por testes enquanto existir.
describe("MultiSelectSearchStep", () => {
  beforeEach(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  function createProps(
    overrides?: Partial<MultiSelectSearchStepProps>
  ): MultiSelectSearchStepProps {
    return {
      icon: Mortarboard02Icon,
      stepTag: "PRÉ-QUESTIONÁRIO · FORMAÇÃO ACADÊMICA",
      journeyTitle: "Encarregado de Dados",
      title: "Formação acadêmica",
      description: "Selecione um ou mais cursos.",
      searchTerm: "",
      onSearchChange: vi.fn(),
      searchPlaceholder: "Pesquisar curso...",
      searchAriaLabel: "Pesquisar curso",
      groups: [
        { id: "1", label: "Graduação (Bacharelado/Licenciatura/Tecnólogo)" },
        { id: "2", label: "Pós-Graduação (lato sensu)" },
      ],
      activeGroupId: "1",
      onGroupChange: vi.fn(),
      groupsAriaLabel: "Níveis de formação",
      items: [
        { id: "10", label: "Direito" },
        { id: "11", label: "Ciência da Computação", description: "Bacharelado" },
      ],
      selectedItems: [],
      onToggleItem: vi.fn(),
      onRemoveItem: vi.fn(),
      removeItemAriaLabel: (label) => `Remover ${label}`,
      emptyLabel: "Nenhum curso encontrado.",
      counterLabel: "0 curso(s) selecionado(s)",
      onContinue: vi.fn(),
      onBack: vi.fn(),
      onExit: vi.fn(),
      backLabel: "Voltar",
      continueLabel: "Continuar",
      savingLabel: "Salvando...",
      exitLabel: "Sair",
      ...overrides,
    };
  }

  it("deve renderizar busca rotulada, abas acessíveis e itens como checkboxes reais", () => {
    render(<MultiSelectSearchStep {...createProps()} />);

    expect(screen.getByRole("searchbox", { name: "Pesquisar curso" })).toBeDefined();

    const tablist = screen.getByRole("tablist", { name: "Níveis de formação" });
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");

    const checkbox = screen.getByRole("checkbox", { name: /Direito/ });
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    expect(screen.getByText("Bacharelado")).toBeDefined();
  });

  it("deve marcar itens selecionados, exibir chips e chamar onRemoveItem pelo chip", () => {
    const props = createProps({
      selectedItems: [{ id: "10", label: "Direito" }],
      counterLabel: "1 curso(s) selecionado(s)",
    });
    render(<MultiSelectSearchStep {...props} />);

    expect(
      (screen.getByRole("checkbox", { name: /Direito/ }) as HTMLInputElement).checked
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Remover Direito" }));
    expect(props.onRemoveItem).toHaveBeenCalledWith("10");

    const counter = screen.getByText("1 curso(s) selecionado(s)");
    expect(counter.getAttribute("aria-live")).toBe("polite");
  });

  it("deve chamar onToggleItem ao clicar na linha do item e onSearchChange ao digitar", () => {
    const props = createProps();
    render(<MultiSelectSearchStep {...props} />);

    fireEvent.click(screen.getByText("Ciência da Computação"));
    expect(props.onToggleItem).toHaveBeenCalledWith("11");

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "dir" } });
    expect(props.onSearchChange).toHaveBeenCalledWith("dir");
  });

  it("deve trocar de aba ao clicar em outra aba", () => {
    const props = createProps();
    render(<MultiSelectSearchStep {...props} />);

    const tab = screen.getByRole("tab", { name: /Pós-Graduação/ });
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
    expect(props.onGroupChange).toHaveBeenCalledWith("2");
  });

  it("deve exibir a lista sem abas quando não houver grupos", () => {
    render(<MultiSelectSearchStep {...createProps({ groups: undefined })} />);

    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("deve anunciar o estado vazio quando não houver itens", () => {
    render(<MultiSelectSearchStep {...createProps({ items: [] })} />);

    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Nenhum curso encontrado.");
  });

  it("deve permitir continuar sem seleção e travar com isContinueDisabled ou durante o salvamento", () => {
    const props = createProps();
    const { rerender } = render(<MultiSelectSearchStep {...props} />);

    const continueButton = () => screen.getByRole("button", { name: /Continuar|Salvando/ });
    expect((continueButton() as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(continueButton());
    expect(props.onContinue).toHaveBeenCalled();

    rerender(<MultiSelectSearchStep {...props} isContinueDisabled />);
    expect((continueButton() as HTMLButtonElement).disabled).toBe(true);

    rerender(<MultiSelectSearchStep {...props} isSubmitting />);
    expect(screen.getByText("Salvando...")).toBeDefined();
    expect((continueButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it("deve chamar onBack e onExit pelos botões de navegação", () => {
    const props = createProps();
    render(<MultiSelectSearchStep {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    fireEvent.click(screen.getByRole("button", { name: /Sair/ }));
    expect(props.onBack).toHaveBeenCalled();
    expect(props.onExit).toHaveBeenCalled();
  });

  it("com o limite atingido, deve exibir o aviso e desabilitar só os itens não selecionados", () => {
    const props = createProps({
      maxSelectable: 1,
      limitReachedLabel: "Você atingiu o limite de 1 certificação.",
      selectedItems: [{ id: "10", label: "Direito" }],
    });
    render(<MultiSelectSearchStep {...props} />);

    expect(screen.getByRole("status").textContent).toBe(
      "Você atingiu o limite de 1 certificação."
    );

    const notSelected = screen.getByRole("checkbox", { name: /Ciência da Computação/ });
    expect(notSelected.getAttribute("aria-disabled")).toBe("true");
    // Continua focável para o leitor de tela, mas não altera a seleção
    expect((notSelected as HTMLInputElement).disabled).toBe(false);
    fireEvent.click(screen.getByText("Ciência da Computação"));
    expect(props.onToggleItem).not.toHaveBeenCalled();

    // O selecionado continua podendo ser desmarcado
    const selected = screen.getByRole("checkbox", { name: /Direito/ });
    expect(selected.getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(selected);
    expect(props.onToggleItem).toHaveBeenCalledWith("10");
  });

  it("abaixo do limite, não deve exibir o aviso nem desabilitar itens", () => {
    render(
      <MultiSelectSearchStep
        {...createProps({ maxSelectable: 5, limitReachedLabel: "Limite atingido." })}
      />
    );

    expect(screen.queryByText("Limite atingido.")).toBeNull();
    for (const checkbox of screen.getAllByRole("checkbox")) {
      expect(checkbox.getAttribute("aria-disabled")).toBeNull();
    }
  });

  it("deve usar uma coluna por aba em telas maiores", () => {
    render(<MultiSelectSearchStep {...createProps()} />);

    const tablist = screen.getByRole("tablist");
    expect(tablist.style.getPropertyValue("--tab-columns")).toBe("2");
  });

  it("deve limitar a altura da área de chips, com rolagem própria", () => {
    render(
      <MultiSelectSearchStep
        {...createProps({ selectedItems: [{ id: "10", label: "Direito" }] })}
      />
    );

    const chips = screen.getByTestId("multi-select-chips");
    expect(chips.className).toContain("max-h-36");
    expect(chips.className).toContain("overflow-y-auto");
  });

  it("deve truncar os textos do cabeçalho com reticências e expor o texto completo no title", () => {
    render(<MultiSelectSearchStep {...createProps()} />);

    const stepTag = screen.getByText("PRÉ-QUESTIONÁRIO · FORMAÇÃO ACADÊMICA");
    expect(stepTag.getAttribute("title")).toBe("PRÉ-QUESTIONÁRIO · FORMAÇÃO ACADÊMICA");
    expect(stepTag.className).toContain("truncate");

    const journeyTitle = screen.getByText("Encarregado de Dados");
    expect(journeyTitle.getAttribute("title")).toBe("Encarregado de Dados");
    expect(journeyTitle.className).toContain("truncate");
  });
});
