/**
 * Lê o nome do arquivo de um cabeçalho Content-Disposition. Prefere
 * `filename*` (RFC 5987, com UTF-8 codificado) e usa `filename` como
 * alternativa. Sem cabeçalho ou sem nome, devolve null.
 */
export function parseContentDispositionFilename(header: string | null | undefined): string | null {
  if (!header) return null;

  const encoded = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(header);
  if (encoded) {
    try {
      const name = decodeURIComponent(encoded[2].trim().replace(/^"|"$/g, ""));
      if (name) return name;
    } catch {
      // Codificação inválida: tenta o `filename` simples abaixo
    }
  }

  const plain = /filename\s*=\s*("([^"]*)"|[^;]+)/i.exec(header);
  const name = (plain?.[2] ?? plain?.[1] ?? "").trim();
  return name || null;
}

/** Salva um Blob como arquivo no navegador, com o nome informado. */
export function saveBlobAsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Alguns navegadores ainda leem a URL logo depois do clique
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
