import type { Ciudad } from "../types/City";
import type { Config } from "../types/Config";
import { obtenerPronostico } from "../api/weather";
import { aviso, error, mensajeError } from "../presentation/output";
import { pintarPronostico } from "../presentation/weatherDisplay";
import { todasCiudades } from "../storage/citiesStorage";

async function mostrarPronostico(config: Config, ciudad: Ciudad): Promise<void> {
  try {
    const pronostico = await obtenerPronostico(ciudad, config.unidad);
    pintarPronostico(ciudad, pronostico);
  } catch (e) {
    error(`No se pudo obtener el pronóstico de ${ciudad.nombre}: ${mensajeError(e)}.`);
  }
}

export async function pronosticoCiudadDefault(config: Config): Promise<void> {
  const porDefecto = config.ciudadDefault;
  if (!porDefecto) {
    aviso("No hay ciudad por defecto. Usa la opción 5 para establecer una.");
    return;
  }
  await mostrarPronostico(config, porDefecto);
}

export async function pronosticoTodasCiudades(config: Config): Promise<void> {
  const todas = todasCiudades(config);
  if (todas.length === 0) {
    aviso("Todavía no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const ciudad of todas) {
    await mostrarPronostico(config, ciudad);
  }
  console.log("");
}
