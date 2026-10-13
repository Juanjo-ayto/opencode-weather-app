import type { Ciudad } from "../types/City";
import { buscarCiudades } from "../api/geocoding";
import { leerTexto } from "../presentation/input";
import { aviso, error, mensajeError } from "../presentation/output";
import { dim } from "../utils/colors";
import { etiquetaCiudad } from "../utils/format";
import { listarCiudades } from "./listCities";

export async function elegirCiudad(): Promise<Ciudad | null> {
  const nombre = await leerTexto("  Nombre de la ciudad (vacío para cancelar): ");
  if (nombre === null || nombre === "") {
    aviso("Búsqueda cancelada.");
    return null;
  }
  let resultados: Ciudad[];
  try {
    resultados = await buscarCiudades(nombre);
  } catch (e) {
    error(`No se pudo consultar la API de geocoding: ${mensajeError(e)}.`);
    return null;
  }
  if (resultados.length === 0) {
    aviso(`No se encontraron resultados para "${nombre}".`);
    return null;
  }
  if (resultados.length === 1) {
    return resultados[0] ?? null;
  }
  console.log("  Elige un resultado:");
  listarCiudades(resultados);
  console.log(dim("    0. Cancelar"));
  const seleccion = await leerTexto("  Opción: ");
  const numero = Number(seleccion);
  if (!Number.isInteger(numero) || numero < 0 || numero > resultados.length) {
    aviso("Selección no válida.");
    return null;
  }
  if (numero === 0) return null;
  return resultados[numero - 1] ?? null;
}

export async function elegirDeLista(ciudades: Ciudad[], mensaje: string): Promise<Ciudad | null> {
  listarCiudades(ciudades);
  const seleccion = await leerTexto(mensaje);
  const numero = Number(seleccion);
  if (!Number.isInteger(numero) || numero < 1 || numero > ciudades.length) {
    aviso("Selección no válida.");
    return null;
  }
  return ciudades[numero - 1] ?? null;
}
