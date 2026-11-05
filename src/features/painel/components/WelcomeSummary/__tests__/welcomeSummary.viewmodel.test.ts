// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWelcomeSummaryVM } from "../welcomeSummary.viewmodel";

describe("useWelcomeSummaryVM", () => {
  it("deve repassar os dados de boas-vindas do usuário", () => {
    const { result } = renderHook(() =>
      useWelcomeSummaryVM({
        userName: "Ana",
        userRole: "Gerente de TI",
        organization: "Governo",
        greetingTitle: "Olá, Ana",
        greetingSubtitle: "Bem-vinda de volta",
        organizationLabelText: "Organização: Governo",
      })
    );

    expect(result.current.userName).toBe("Ana");
    expect(result.current.userRole).toBe("Gerente de TI");
    expect(result.current.organization).toBe("Governo");
    expect(result.current.greetingTitle).toBe("Olá, Ana");
  });
});

