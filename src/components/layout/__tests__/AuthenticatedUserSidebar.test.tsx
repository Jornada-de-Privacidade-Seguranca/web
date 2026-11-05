// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import React from "react";
import { AuthenticatedUserSidebar } from "../AuthenticatedUserSidebar";
import { PageShell } from "../PageShell";
import { useSidebarStore } from "@/store/sidebar.store";

let mockIsMobile = true;
let mockPathname = "/painel";

vi.mock("@/hooks/useMobile", () => ({
  useIsMobile: () => mockIsMobile,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Maria Oliveira", profile: { label: "Usuário comum" } },
    logout: vi.fn(),
  }),
}));

vi.mock("@/shared/i18n/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

// O cabeçalho tem seletores de idioma e tema, fora do escopo destes testes
vi.mock("../IdiomSwitch", () => ({ IdiomSwitch: () => null }));
vi.mock("../SwitchThemeButton", () => ({ SwitchThemeButton: () => null }));

// O jsdom não implementa o ResizeObserver, usado pelo cabeçalho
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

function renderLayout() {
  return render(
    <>
      <AuthenticatedUserSidebar />
      <PageShell title="Painel">
        <p>Conteúdo</p>
      </PageShell>
    </>
  );
}

function getToggle() {
  return screen.getByRole("button", { name: /sidebar\.toggle\.(open|close)/ });
}

describe("AuthenticatedUserSidebar", () => {
  beforeEach(() => {
    mockIsMobile = true;
    mockPathname = "/painel";
    useSidebarStore.setState({ isExpanded: true, isMobileOpen: false });
  });

  afterEach(() => {
    cleanup();
  });

  describe("abaixo do breakpoint md", () => {
    it("deve começar com o drawer fechado e fora da árvore de acessibilidade", () => {
      renderLayout();

      const drawer = document.getElementById("app-sidebar")!;
      expect(drawer.getAttribute("role")).toBe("dialog");
      expect(drawer.getAttribute("data-state")).toBe("closed");
      expect(drawer.hasAttribute("inert")).toBe(true);
      // O inert já tira o drawer da árvore; aria-hidden com foco dentro gera aviso
      expect(drawer.hasAttribute("aria-hidden")).toBe(false);
      expect(getToggle().getAttribute("aria-expanded")).toBe("false");
      expect(getToggle().getAttribute("aria-controls")).toBe("app-sidebar");
    });

    it("deve abrir o drawer pelo botão do cabeçalho e mover o foco para ele", () => {
      renderLayout();

      fireEvent.click(getToggle());

      const drawer = screen.getByRole("dialog", { name: "sidebar.drawerLabel" });
      expect(drawer.getAttribute("data-state")).toBe("open");
      expect(drawer.getAttribute("aria-modal")).toBe("true");
      expect(getToggle().getAttribute("aria-expanded")).toBe("true");
      expect(getToggle().getAttribute("aria-label")).toBe("sidebar.toggle.close");
      expect(drawer.contains(document.activeElement)).toBe(true);
    });

    it("deve mostrar os rótulos dos itens mesmo com a barra recolhida no desktop", () => {
      useSidebarStore.setState({ isExpanded: false, isMobileOpen: true });
      renderLayout();

      const link = screen.getByText("sidebar.dashboard");
      expect(link.className).toContain("opacity-100");
    });

    it("deve fechar o drawer com Esc e devolver o foco ao botão", () => {
      renderLayout();
      const toggle = getToggle();
      toggle.focus();
      fireEvent.click(toggle);

      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

      expect(useSidebarStore.getState().isMobileOpen).toBe(false);
      expect(document.activeElement).toBe(toggle);
    });

    it("deve fechar o drawer ao clicar no fundo escurecido", () => {
      renderLayout();
      fireEvent.click(getToggle());

      fireEvent.click(screen.getByTestId("sidebar-backdrop"));

      expect(useSidebarStore.getState().isMobileOpen).toBe(false);
    });

    it("deve fechar o drawer ao navegar por um de seus links", () => {
      renderLayout();
      fireEvent.click(getToggle());

      fireEvent.click(screen.getByText("sidebar.journeys").closest("a")!);

      expect(useSidebarStore.getState().isMobileOpen).toBe(false);
    });

    it("deve manter o foco dentro do drawer ao navegar com Tab", () => {
      renderLayout();
      fireEvent.click(getToggle());
      const drawer = screen.getByRole("dialog");
      const focusables = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const last = focusables[focusables.length - 1];
      last.focus();

      fireEvent.keyDown(last, { key: "Tab" });

      expect(document.activeElement).toBe(focusables[0]);
    });

    it("deve manter o foco dentro do drawer ao navegar pelo menu do usuário em portal", () => {
      renderLayout();
      fireEvent.click(getToggle());

      fireEvent.click(screen.getByRole("button", { name: /Maria Oliveira/ }));
      const logoutButton = screen.getByRole("button", {
        name: "sidebar.userMenu.logout",
      });
      const firstDrawerFocusable = screen
        .getByRole("dialog", { name: "sidebar.drawerLabel" })
        .querySelector<HTMLElement>('a[href]')!;

      logoutButton.focus();
      fireEvent.keyDown(logoutButton, { key: "Tab" });
      expect(document.activeElement).toBe(firstDrawerFocusable);

      const drawerFocusables = screen
        .getByRole("dialog", { name: "sidebar.drawerLabel" })
        .querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
      const lastDrawerFocusable = drawerFocusables[drawerFocusables.length - 1];
      fireEvent.keyDown(firstDrawerFocusable, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(lastDrawerFocusable);
    });

    it("deve deixar o conteúdo sem o recuo da barra", () => {
      renderLayout();

      const header = screen.getByRole("banner");
      expect(header.className).toContain("left-0");
      expect(header.className).not.toMatch(/(^|\s)left-(18|64)(\s|$)/);
    });
  });

  describe("a partir do breakpoint md", () => {
    beforeEach(() => {
      mockIsMobile = false;
    });

    it("deve manter a barra fixa, sem diálogo, alternando entre expandida e recolhida", () => {
      renderLayout();
      const sidebar = document.getElementById("app-sidebar")!;

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(sidebar.getAttribute("data-state")).toBe("expanded");
      expect(getToggle().getAttribute("aria-expanded")).toBe("true");
      expect(getToggle().getAttribute("aria-label")).toBe("sidebar.toggle.close");

      fireEvent.click(getToggle());

      expect(sidebar.getAttribute("data-state")).toBe("collapsed");
      expect(getToggle().getAttribute("aria-expanded")).toBe("false");
      expect(getToggle().getAttribute("aria-label")).toBe("sidebar.toggle.open");
      expect(useSidebarStore.getState().isMobileOpen).toBe(false);
    });

    it("deve fechar o drawer aberto ao passar para a largura de desktop", () => {
      mockIsMobile = true;
      useSidebarStore.setState({ isMobileOpen: true });
      const { rerender } = renderLayout();

      mockIsMobile = false;
      act(() => {
        rerender(
          <>
            <AuthenticatedUserSidebar />
            <PageShell title="Painel">
              <p>Conteúdo</p>
            </PageShell>
          </>
        );
      });

      expect(useSidebarStore.getState().isMobileOpen).toBe(false);
    });
  });
});
