import type { Config } from "../types/Config";
import { aviso, exito } from "../presentation/output";
import { eliminarCiudad, guardarCiudades } from "../storage/citiesStorage";
import { etiquetaCiudad } from "../utils/format";
import { elegirDeLista } from "./selectCity";

export async function eliminarCiudadDeLaLista(config: Config): Promise<void> {
  if (config.ciudades.length === 0) {
    aviso("No hay ciudades guardadas que eliminar.");
    return;
  }
  const eliminada = await elegirDeLista(config.ciudades, "  ¿Cuál eliminar? ");
  if (!eliminada) return;
  eliminarCiudad(config, eliminada);
  await guardarCiudades(config);
  exito(`Ciudad eliminada: ${etiquetaCiudad(eliminada)}.`);
}
