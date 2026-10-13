import { rojo, verde, amarillo, negrita, cian, dim } from "../utils/colors";

export function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function error(mensaje: string): void {
  console.log(rojo(`  ${mensaje}`));
}

export function exito(mensaje: string): void {
  console.log(verde(`  ${mensaje}`));
}

export function aviso(mensaje: string): void {
  console.log(amarillo(`  ${mensaje}`));
}

export function bienvenida(): void {
  console.log(
    `  ${negrita(cian("Bienvenido a Weather CLI."))} ${dim("Configuración en ~/.weather-cli.json")}`,
  );
}

export function despedida(saltoInicial = false): void {
  console.log(`${saltoInicial ? "\n" : ""}  ${negrita(cian("¡Hasta luego!"))}`);
}
