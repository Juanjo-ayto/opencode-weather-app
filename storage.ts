import { homedir } from "node:os";
import type { Ciudad, Config, Unidad } from "./types";

export const RUTA_CONFIG = `${homedir()}/.weather-cli.json`;

const CONFIG_VACIA: Config = { ciudadDefault: null, ciudades: [], unidad: "c" };

function esCiudad(valor: unknown): valor is Ciudad {
  if (typeof valor !== "object" || valor === null) return false;
  const c = valor as Record<string, unknown>;
  return typeof c.nombre === "string" && typeof c.lat === "number" && typeof c.lon === "number";
}

export async function cargarConfig(): Promise<Config> {
  try {
    const texto = await Bun.file(RUTA_CONFIG).text();
    const datos = JSON.parse(texto) as Record<string, unknown>;
    const ciudades = Array.isArray(datos.ciudades) ? datos.ciudades.filter(esCiudad) : [];
    const unidad: Unidad = datos.unidad === "f" ? "f" : "c";
    const porDefecto = esCiudad(datos.ciudadDefault) ? datos.ciudadDefault : null;
    return { ciudadDefault: porDefecto, ciudades, unidad };
  } catch {
    return { ...CONFIG_VACIA, ciudades: [] };
  }
}

export async function guardarConfig(config: Config): Promise<void> {
  await Bun.write(RUTA_CONFIG, `${JSON.stringify(config, null, 2)}\n`);
}
