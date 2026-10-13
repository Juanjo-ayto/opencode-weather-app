import type { Ciudad } from "../types/City";
import type { Config } from "../types/Config";
import { obtenerClima } from "../api/weather";
import { aviso, error, mensajeError } from "../presentation/output";
import { pintarClima } from "../presentation/weatherDisplay";
import { todasCiudades } from "../storage/citiesStorage";

async function mostrarClima(config: Config, ciudad: Ciudad): Promise<void> {
  try {
    const clima = await obtenerClima(ciudad, config.unidad);
    pintarClima(ciudad, clima);
  } catch (e) {
    error(`No se pudo obtener el clima de ${ciudad.nombre}: ${mensajeError(e)}.`);
  }
}

export async function climaCiudadDefault(config: Config): Promise<void> {
  const porDefecto = config.ciudadDefault;
  if (!porDefecto) {
    aviso("No hay ciudad por defecto. Usa la opción 5 para establecer una.");
    return;
  }
  await mostrarClima(config, porDefecto);
}

export async function climaTodasCiudades(config: Config): Promise<void> {
  const todas = todasCiudades(config);
  if (todas.length === 0) {
    aviso("Todavía no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const ciudad of todas) {
    await mostrarClima(config, ciudad);
  }
  console.log("");
}
