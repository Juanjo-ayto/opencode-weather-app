export type Unidad = "c" | "f";

export interface Ciudad {
  nombre: string;
  lat: number;
  lon: number;
  pais?: string;
  region?: string;
}

export interface Config {
  ciudadDefault: Ciudad | null;
  ciudades: Ciudad[];
  unidad: Unidad;
}
