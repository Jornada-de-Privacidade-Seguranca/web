import { describe, expect, it } from "vitest";
import { pageSearchParamsToQueryString } from "../queryString";

describe("pageSearchParamsToQueryString", () => {
  it("deve remontar a query string mantendo chaves repetidas e ignorando valores ausentes", () => {
    expect(
      pageSearchParamsToQueryString({
        search: "ana silva",
        domains: ["privacy", "joint"],
        page: "2",
        empty: undefined,
      })
    ).toBe("search=ana+silva&domains=privacy&domains=joint&page=2");
  });

  it("deve devolver vazio sem parâmetros", () => {
    expect(pageSearchParamsToQueryString({})).toBe("");
  });
});
