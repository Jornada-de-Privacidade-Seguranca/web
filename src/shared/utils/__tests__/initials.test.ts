import { describe, it, expect } from "vitest";
import { getInitials } from "../initials";

describe("getInitials", () => {
  it("deve extrair a primeira letra do primeiro e do último nome", () => {
    expect(getInitials("Carlos Santos")).toBe("CS");
    expect(getInitials("Maria Eduarda Silva")).toBe("MS");
  });

  it("deve extrair as duas primeiras letras para nomes simples", () => {
    expect(getInitials("Ana")).toBe("AN");
  });

  it("deve lidar com strings vazias e com múltiplos espaços", () => {
    expect(getInitials("")).toBe("");
    expect(getInitials("   ")).toBe("");
    expect(getInitials("  João   Silva  ")).toBe("JS");
  });
});
