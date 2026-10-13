import type { Ciudad } from "./City";
import type { Unidad } from "./Weather";

export interface Config {
  ciudadDefault: Ciudad | null;
  ciudades: Ciudad[];
  unidad: Unidad;
}
