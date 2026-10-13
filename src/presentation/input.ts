import type { MenuOption } from "../types/MenuOption";
import { negrita } from "../utils/colors";

const OPCIONES_VALIDAS: readonly string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export async function leerOpcion(): Promise<MenuOption | null> {
  const respuesta = prompt(`${negrita("  Selecciona una opción")}: `);
  if (respuesta === null) return null;
  const texto = respuesta.trim();
  return OPCIONES_VALIDAS.includes(texto) ? (texto as MenuOption) : "invalida";
}

export async function leerTexto(mensaje: string): Promise<string | null> {
  const respuesta = prompt(mensaje);
  if (respuesta === null) return null;
  return respuesta.trim();
}
