import type { Config } from "../types/Config";
import type { Unidad } from "../types/Weather";
import { escribirConfig, leerConfig } from "./configFile";

export async function cargarConfig(): Promise<Config> {
  return leerConfig();
}

export async function guardarConfig(config: Config): Promise<void> {
  return escribirConfig(config);
}

export function cambiarUnidad(unidad: Unidad): Unidad {
  return unidad === "c" ? "f" : "c";
}
