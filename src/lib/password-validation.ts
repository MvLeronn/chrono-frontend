export function passwordError(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return "Digite sua senha para continuar.";
  if (new TextEncoder().encode(value).length > 72) return "A senha deve ter no máximo 72 bytes. Caracteres acentuados podem ocupar mais de um byte.";
}
