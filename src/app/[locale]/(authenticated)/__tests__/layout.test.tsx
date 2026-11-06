// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import AuthenticatedLayout from "../layout";
import { useSidebarStore } from "@/store/sidebar.store";

vi.mock("@/hooks/useAuthGuard", () => ({
  useRequireAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    sessionExpired: false,
    goToLogin: vi.fn(),
  }),
}));

vi.mock("@/components/layout/AuthenticatedUserSidebar", () => ({
  AuthenticatedUserSidebar: () => null,
}));

vi.mock("@/components/layout/SessionTimeoutWarning", () => ({
  SessionTimeoutWarning: () => null,
}));

describe("AuthenticatedLayout", () => {
  beforeEach(() => {
    useSidebarStore.setState({ isMobileOpen: false });
  });

  afterEach(() => {
    cleanup();
  });

  it("deve deixar o conteúdo rolar com o drawer fechado", () => {
    render(<AuthenticatedLayout>conteúdo</AuthenticatedLayout>);

    expect(screen.getByRole("main").className).not.toContain("overflow-hidden");
  });

  it("deve travar a rolagem do conteúdo abaixo de md com o drawer aberto", () => {
    useSidebarStore.setState({ isMobileOpen: true });
    render(<AuthenticatedLayout>conteúdo</AuthenticatedLayout>);

    expect(screen.getByRole("main").className).toContain("max-md:overflow-hidden");
  });
});
