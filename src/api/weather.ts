import type { Ciudad } from "../types/City";
import type { ClimaActual, DiaPronostico, Pronostico, Unidad } from "../types/Weather";
import { URL_FORECAST } from "../utils/constants";
import { pedirJson } from "./client";

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

export async function obtenerClima(ciudad: Ciudad, unidad: Unidad): Promise<ClimaActual> {
  const params = new URLSearchParams({
    latitude: String(ciudad.lat),
    longitude: String(ciudad.lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "auto",
  });
  if (unidad === "f") params.set("temperature_unit", "fahrenheit");
  const url = `${URL_FORECAST}?${params.toString()}`;
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
    sensacion:
      typeof actual.apparent_temperature === "number"
        ? actual.apparent_temperature
        : actual.temperature_2m,
    humedad: typeof actual.relative_humidity_2m === "number" ? actual.relative_humidity_2m : 0,
    viento: typeof actual.wind_speed_10m === "number" ? actual.wind_speed_10m : 0,
    codigoClima: actual.weather_code,
    unidadTemperatura: datos.current_units?.temperature_2m ?? (unidad === "f" ? "°F" : "°C"),
  };
}

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
  const url = `${URL_FORECAST}?${params.toString()}`;
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
