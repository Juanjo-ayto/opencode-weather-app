import type { Ciudad, Unidad } from "./types";

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

export interface ClimaActual {
  hora: string;
  temperatura: number;
  sensacion: number;
  humedad: number;
  viento: number;
  codigoClima: number;
  unidadTemperatura: string;
}

interface RespuestaClima {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  current_units?: {
    temperature_2m?: string;
  };
}

async function pedirJson(url: string): Promise<unknown> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url);
  } catch (e) {
    throw new Error(`sin conexión (${e instanceof Error ? e.message : String(e)})`);
  }
  if (!respuesta.ok) {
    throw new Error(`la API devolvió HTTP ${respuesta.status}`);
  }
  return respuesta.json();
}

export async function buscarCiudades(nombre: string): Promise<Ciudad[]> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombre)}` +
    `&count=5&language=es&format=json`;
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

export async function obtenerClima(ciudad: Ciudad, unidad: Unidad): Promise<ClimaActual> {
  const params = new URLSearchParams({
    latitude: String(ciudad.lat),
    longitude: String(ciudad.lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "auto",
  });
  if (unidad === "f") params.set("temperature_unit", "fahrenheit");
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const datos = (await pedirJson(url)) as RespuestaClima;
  const actual = datos.current;
  if (
    !actual ||
    typeof actual.temperature_2m !== "number" ||
    typeof actual.weather_code !== "number"
  ) {
    throw new Error("respuesta inesperada de la API de previsión");
  }
  return {
    hora: (actual.time ?? "").replace("T", " "),
    temperatura: actual.temperature_2m,
    sensacion: typeof actual.apparent_temperature === "number" ? actual.apparent_temperature : actual.temperature_2m,
    humedad: typeof actual.relative_humidity_2m === "number" ? actual.relative_humidity_2m : 0,
    viento: typeof actual.wind_speed_10m === "number" ? actual.wind_speed_10m : 0,
    codigoClima: actual.weather_code,
    unidadTemperatura: datos.current_units?.temperature_2m ?? (unidad === "f" ? "°F" : "°C"),
  };
}
