export function sinAnsi(texto: string): string {
  return texto.replace(/\x1b\[[0-9;]*m/g, "");
}
