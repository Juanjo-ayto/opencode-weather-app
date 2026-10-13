import type { Unidad } from "./types";

const ANCHO = 40;

export function pintarMenu(unidad: Unidad, totalCiudades: number): void {
  const linea = "═".repeat(ANCHO);
  const ajustes = unidad === "c" ? "°C" : "°F";
  console.log(linea);
  console.log("         WEATHER CLI");
  console.log(linea);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${totalCiudades})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${ajustes})`);
  console.log("  9. Salir");
  console.log(linea);
}

export async function leerOpcion(): Promise<string | null> {
  const respuesta = prompt("  Selecciona una opción: ");
  if (respuesta === null) return null;
  return respuesta.trim();
}

export async function leerTexto(mensaje: string): Promise<string | null> {
  const respuesta = prompt(mensaje);
  if (respuesta === null) return null;
  return respuesta.trim();
}
