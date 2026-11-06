/**
 * Retorna as iniciais do nome fornecido (até 2 caracteres em maiúsculas).
 * Ex: "Ana Beatriz Silva" -> "AS", "Carlos" -> "CA", "" -> ""
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
