import type { Ciudad } from "../types/City";
import { etiquetaCiudad } from "../utils/format";

export function listarCiudades(ciudades: Ciudad[]): void {
  ciudades.forEach((c, i) => console.log(`    ${i + 1}. ${etiquetaCiudad(c)}`));
}
