import type { Ciudad } from "../types/City";
import { URL_GEOCODING } from "../utils/constants";
import { pedirJson } from "./client";

interface ResultadoGeocoding {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface RespuestaGeocoding {
  results?: ResultadoGeocoding[];
}

export async function buscarCiudades(nombre: string): Promise<Ciudad[]> {
  const url =
    `${URL_GEOCODING}?name=${encodeURIComponent(nombre)}` + `&count=5&language=es&format=json`;
  const datos = (await pedirJson(url)) as RespuestaGeocoding;
  if (!datos.results) return [];
  return datos.results.map((r) => ({
    nombre: r.name,
    lat: r.latitude,
    lon: r.longitude,
    pais: r.country,
    region: r.admin1,
  }));
}
