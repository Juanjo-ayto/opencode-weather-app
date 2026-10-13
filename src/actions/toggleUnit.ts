import type { Config } from "../types/Config";
import { exito } from "../presentation/output";
import { cambiarUnidad, guardarConfig } from "../storage/settingsStorage";

export async function alternarUnidad(config: Config): Promise<void> {
  config.unidad = cambiarUnidad(config.unidad);
  await guardarConfig(config);
  exito(`Unidad de temperatura cambiada a ${config.unidad === "c" ? "°C" : "°F"}.`);
}
