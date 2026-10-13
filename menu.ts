import type { Unidad } from "./types";
<<<<<<< HEAD
=======
import { amarillo, cian, dim, negrita } from "./color";
>>>>>>> 02-forecast

const ANCHO = 40;

export function pintarMenu(unidad: Unidad, totalCiudades: number): void {
<<<<<<< HEAD
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
=======
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
>>>>>>> 02-forecast
  console.log(linea);
}

export async function leerOpcion(): Promise<string | null> {
<<<<<<< HEAD
  const respuesta = prompt("  Selecciona una opción: ");
=======
  const respuesta = prompt(`${negrita("  Selecciona una opción")}: `);
>>>>>>> 02-forecast
  if (respuesta === null) return null;
  return respuesta.trim();
}

export async function leerTexto(mensaje: string): Promise<string | null> {
  const respuesta = prompt(mensaje);
  if (respuesta === null) return null;
  return respuesta.trim();
}
