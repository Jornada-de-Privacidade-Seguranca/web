// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { parseContentDispositionFilename, saveBlobAsFile } from "../fileDownload";

describe("parseContentDispositionFilename", () => {
  it.each([
    ['attachment; filename="resultado-jornada-10-2026-11-09.pdf"', "resultado-jornada-10-2026-11-09.pdf"],
    ["attachment; filename=resultado.pdf", "resultado.pdf"],
    ["attachment; filename*=UTF-8''resultado%20jornada%20%C3%A1rea.pdf", "resultado jornada área.pdf"],
    ['attachment; filename="fallback.pdf"; filename*=UTF-8\'\'preferido.pdf', "preferido.pdf"],
  ])("deve ler o nome de %s", (header, expected) => {
    expect(parseContentDispositionFilename(header)).toBe(expected);
  });

  it.each([null, undefined, "", "attachment", 'attachment; filename=""'])(
    "deve devolver null sem nome (%s)",
    (header) => {
      expect(parseContentDispositionFilename(header)).toBeNull();
    }
  );

  it("deve usar o filename simples quando o filename* for inválido", () => {
    expect(parseContentDispositionFilename('attachment; filename="ok.pdf"; filename*=UTF-8\'\'%E0%A4%A')).toBe("ok.pdf");
  });
});

describe("saveBlobAsFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve baixar o arquivo com o nome informado e liberar a URL", () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => "blob:resultado");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const blob = new Blob(["%PDF"], { type: "application/pdf" });

    saveBlobAsFile(blob, "resultado.pdf");

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    const link = click.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(link.download).toBe("resultado.pdf");
    expect(link.href).toBe("blob:resultado");
    expect(document.querySelector("a[download]")).toBeNull();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:resultado");
    vi.useRealTimers();
  });
});
