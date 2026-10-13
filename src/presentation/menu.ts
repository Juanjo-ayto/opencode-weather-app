import type { Unidad } from "./types";
import { amarillo, cian, dim, negrita } from "./color";

const ANCHO = 40;

export function pintarMenu(unidad: Unidad, totalCiudades: number): void {
  const linea = cian("═".repeat(ANCHO));
  const ajustes = unidad === "c" ? "°C" : "°F";
  console.log(linea);
  console.log(negrita(amarillo("         WEATHER CLI")));
  console.log(linea);
  console.log(`  ${cian(negrita("1"))}. Clima de ciudad default`);
  console.log(`  ${cian(negrita("2"))}. Clima de todas las ciudades ${dim(`(${totalCiudades})`)}`);
  console.log(`  ${cian(negrita("3"))}. Buscar y agregar ciudad`);
  console.log(`  ${cian(negrita("4"))}. Eliminar ciudad`);
  console.log(`  ${cian(negrita("5"))}. Establecer ciudad default`);
  console.log(`  ${cian(negrita("6"))}. Pronóstico 7 días (ciudad default)`);
  console.log(`  ${cian(negrita("7"))}. Pronóstico 7 días de todas las ciudades ${dim(`(${totalCiudades})`)}`);
  console.log(`  ${cian(negrita("8"))}. Ajustes ${dim(`(${ajustes})`)}`);
  console.log(`  ${cian(negrita("9"))}. Salir`);
  console.log(linea);
}

export async function leerOpcion(): Promise<string | null> {
  const respuesta = prompt(`${negrita("  Selecciona una opción")}: `);
  if (respuesta === null) return null;
  return respuesta.trim();
}

export async function leerTexto(mensaje: string): Promise<string | null> {
  const respuesta = prompt(mensaje);
  if (respuesta === null) return null;
  return respuesta.trim();
}
