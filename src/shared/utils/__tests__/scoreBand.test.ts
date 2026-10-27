import { describe, it, expect } from "vitest";
import { normalizeScore, resolveScoreBand } from "../scoreBand";

describe("scoreBand", () => {
  it.each([
    [100, "strong"],
    [75, "strong"],
    [74, "medium"],
    [60, "medium"],
    [59, "weak"],
    [0, "weak"],
  ] as const)("deve classificar %s como %s", (score, band) => {
    expect(resolveScoreBand(score)).toBe(band);
  });

  it("deve arredondar e limitar a nota entre 0 e 100", () => {
    expect(normalizeScore(66.7)).toBe(67);
    expect(normalizeScore(120)).toBe(100);
    expect(normalizeScore(-5)).toBe(0);
    expect(normalizeScore(null)).toBe(0);
    expect(normalizeScore(Number.NaN)).toBe(0);
  });
});
