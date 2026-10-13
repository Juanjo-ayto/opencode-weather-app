import type { Ciudad } from "../types/City";
import type { Config } from "../types/Config";
import { leerTexto } from "../presentation/input";
import { aviso, exito } from "../presentation/output";
import { eliminarCiudad } from "../storage/citiesStorage";
import { guardarConfig } from "../storage/settingsStorage";
import { dim } from "../utils/colors";
import { etiquetaCiudad } from "../utils/format";
import { listarCiudades } from "./listCities";
import { elegirCiudad } from "./selectCity";

export async function establecerCiudadDefault(config: Config): Promise<void> {
  let nueva: Ciudad | null = null;
  if (config.ciudades.length > 0) {
    console.log("  Ciudades guardadas:");
    listarCiudades(config.ciudades);
    console.log(dim("    0. Buscar una ciudad nueva"));
    const seleccion = await leerTexto("  Opción: ");
    const numero = Number(seleccion);
    if (!Number.isInteger(numero) || numero < 0 || numero > config.ciudades.length) {
      aviso("Selección no válida.");
      return;
    }
    if (numero === 0) {
      nueva = await elegirCiudad();
    } else {
      const elegida = config.ciudades[numero - 1] ?? null;
      if (elegida) {
        eliminarCiudad(config, elegida);
      }
      nueva = elegida;
    }
  } else {
    nueva = await elegirCiudad();
  }
  if (!nueva) return;
  config.ciudadDefault = nueva;
  await guardarConfig(config);
  exito(`Ciudad por defecto establecida: ${etiquetaCiudad(nueva)}.`);
}
