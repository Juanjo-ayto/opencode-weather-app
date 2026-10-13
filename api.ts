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

<<<<<<< HEAD
=======
export interface DiaPronostico {
  fecha: string;
  codigoClima: number;
  tempMax: number;
  tempMin: number;
  probLluvia: number;
  vientoMax: number;
}

export interface Pronostico {
  dias: DiaPronostico[];
  unidadTemperatura: string;
}

interface RespuestaPronostico {
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: (number | null)[];
    wind_speed_10m_max?: number[];
  };
  daily_units?: {
    temperature_2m_max?: string;
  };
}

>>>>>>> 02-forecast
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
<<<<<<< HEAD
=======

export async function obtenerPronostico(ciudad: Ciudad, unidad: Unidad): Promise<Pronostico> {
  const params = new URLSearchParams({
    latitude: String(ciudad.lat),
    longitude: String(ciudad.lon),
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
    forecast_days: "7",
    timezone: "auto",
  });
  if (unidad === "f") params.set("temperature_unit", "fahrenheit");
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const datos = (await pedirJson(url)) as RespuestaPronostico;
  const daily = datos.daily;
  const fechas = daily?.time;
  const maximos = daily?.temperature_2m_max;
  const codigos = daily?.weather_code;
  const minimos = daily?.temperature_2m_min;
  const lluvias = daily?.precipitation_probability_max;
  const vientos = daily?.wind_speed_10m_max;
  if (!Array.isArray(fechas) || !Array.isArray(maximos)) {
    throw new Error("respuesta inesperada de la API de previsión");
  }
  const dias: DiaPronostico[] = fechas.map((fecha, i) => ({
    fecha,
    codigoClima: codigos?.[i] ?? 0,
    tempMax: maximos[i] ?? 0,
    tempMin: minimos?.[i] ?? 0,
    probLluvia: lluvias?.[i] ?? 0,
    vientoMax: vientos?.[i] ?? 0,
  }));
  return {
    dias,
    unidadTemperatura: datos.daily_units?.temperature_2m_max ?? (unidad === "f" ? "°F" : "°C"),
  };
}
>>>>>>> 02-forecast
