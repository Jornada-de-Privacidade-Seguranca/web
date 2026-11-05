import { describe, it, expect, vi } from "vitest";
import CompetenciesPage from "../page";

const redirectMock = vi.fn();

vi.mock("@shared/i18n/navigation", () => ({
  redirect: (args: unknown) => redirectMock(args),
}));

describe("CompetenciesPage", () => {
  it.each(["pt", "en"])(
    "deve redirecionar para a primeira área do questionário no idioma %s",
    async (locale) => {
      await CompetenciesPage({ params: Promise.resolve({ locale }) });

      expect(redirectMock).toHaveBeenCalledWith({
        href: "/jornada/atual/competencias/0",
        locale,
      });
    }
  );
});
