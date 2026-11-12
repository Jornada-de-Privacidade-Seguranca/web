// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import NoAuthLayout from "../layout";

const { useRequireGuestMock, pathnameState } = vi.hoisted(() => ({
  useRequireGuestMock: vi.fn(),
  pathnameState: { value: "/login" },
}));

vi.mock("@/hooks/useAuthGuard", () => ({
  useRequireGuest: useRequireGuestMock,
}));

vi.mock("@/shared/i18n/navigation", () => ({
  usePathname: () => pathnameState.value,
}));

vi.mock("@/components/layout/NoAuthHeader", () => ({
  NoAuthHeader: () => <header>cabeçalho</header>,
}));

function renderLayout() {
  return render(
    <NoAuthLayout>
      <p>conteúdo</p>
    </NoAuthLayout>
  );
}

describe("NoAuthLayout", () => {
  beforeEach(() => {
    useRequireGuestMock.mockReset();
  });

  it("não deve mostrar o login para quem já está logado", () => {
    pathnameState.value = "/login";
    useRequireGuestMock.mockReturnValue({ isLoading: false, isAuthenticated: true });

    renderLayout();

    expect(useRequireGuestMock).toHaveBeenCalledWith({ enabled: true });
    expect(screen.queryByText("conteúdo")).toBeNull();
  });

  it("deve mostrar a página do convite para quem já está logado, sem redirecionar", () => {
    pathnameState.value = "/definir-senha-inicial";
    useRequireGuestMock.mockReturnValue({ isLoading: false, isAuthenticated: true });

    renderLayout();

    expect(useRequireGuestMock).toHaveBeenCalledWith({ enabled: false });
    expect(screen.getByText("conteúdo")).toBeTruthy();
    expect(screen.getByText("cabeçalho")).toBeTruthy();
  });

  it("deve mostrar a página do convite enquanto a sessão carrega", () => {
    pathnameState.value = "/definir-senha-inicial";
    useRequireGuestMock.mockReturnValue({ isLoading: true, isAuthenticated: false });

    renderLayout();

    expect(screen.getByText("conteúdo")).toBeTruthy();
  });
});
