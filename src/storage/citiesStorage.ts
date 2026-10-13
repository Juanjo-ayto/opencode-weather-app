import type { Ciudad } from "../types/City";
import type { Config } from "../types/Config";
import { escribirConfig } from "./configFile";

export function todasCiudades(config: Config): Ciudad[] {
  return config.ciudadDefault ? [config.ciudadDefault, ...config.ciudades] : config.ciudades;
}

export function totalCiudades(config: Config): number {
  return config.ciudades.length + (config.ciudadDefault ? 1 : 0);
}

export function ciudadExistente(config: Config, candidata: Ciudad): Ciudad | null {
  return (
    todasCiudades(config).find((c) => c.lat === candidata.lat && c.lon === candidata.lon) ?? null
  );
}

export function agregarCiudad(config: Config, ciudad: Ciudad): void {
  config.ciudades.push(ciudad);
}

export function eliminarCiudad(config: Config, ciudad: Ciudad): void {
  config.ciudades = config.ciudades.filter((c) => c.lat !== ciudad.lat || c.lon !== ciudad.lon);
}

export async function guardarCiudades(config: Config): Promise<void> {
  return escribirConfig(config);
}
