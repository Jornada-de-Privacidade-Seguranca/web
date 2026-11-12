// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdiomSwitch } from "../IdiomSwitch";

const { useLangMock } = vi.hoisted(() => ({
  useLangMock: vi.fn(),
}));

vi.mock("@/hooks/useLang", () => ({
  useLang: useLangMock,
}));

describe("IdiomSwitch Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os idiomas com largura contida e sem ml-auto por padrão", () => {
    const changeLocaleMock = vi.fn();
    useLangMock.mockReturnValue({
      locale: "pt",
      locales: ["pt", "en"] as const,
      changeLocale: changeLocaleMock,
      isPt: true,
      isEn: false,
    });

    const { container } = render(<IdiomSwitch />);
    const wrapper = container.firstElementChild;

    expect(wrapper?.className).toContain("inline-flex");
    expect(wrapper?.className).toContain("w-fit");
    expect(wrapper?.className).not.toContain("ml-auto");

    const ptButton = screen.getByRole("button", { name: "PT" });
    const enButton = screen.getByRole("button", { name: "EN" });

    expect(ptButton.getAttribute("aria-pressed")).toBe("true");
    expect(enButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(enButton);
    expect(changeLocaleMock).toHaveBeenCalledWith("en");
  });

  it("permite receber className externa para posicionamento e alinhamento", () => {
    useLangMock.mockReturnValue({
      locale: "en",
      locales: ["pt", "en"] as const,
      changeLocale: vi.fn(),
      isPt: false,
      isEn: true,
    });

    const { container } = render(<IdiomSwitch className="ml-auto custom-pos" />);
    const wrapper = container.firstElementChild;

    expect(wrapper?.className).toContain("w-fit");
    expect(wrapper?.className).toContain("ml-auto");
    expect(wrapper?.className).toContain("custom-pos");

    expect(screen.getByRole("button", { name: "PT" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("button", { name: "EN" }).getAttribute("aria-pressed")).toBe("true");
  });
});
