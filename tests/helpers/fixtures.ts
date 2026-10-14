import type { Ciudad } from "../../src/types/City";
import type { Config } from "../../src/types/Config";
import type { ClimaActual, Pronostico } from "../../src/types/Weather";

export const madrid: Ciudad = {
  nombre: "Madrid",
  lat: 40.4168,
  lon: -3.7038,
  pais: "España",
  region: "Madrid",
};

export const paris: Ciudad = {
  nombre: "París",
  lat: 48.8566,
  lon: 2.3522,
  pais: "Francia",
  region: "Île-de-France",
};

export const otawa: Ciudad = {
  nombre: "Ottawa",
  lat: 45.41117,
  lon: -75.69812,
  pais: "Canadá",
  region: "Ontario",
};

export function configVacia(): Config {
  return { ciudadDefault: null, ciudades: [], unidad: "c" };
}

export function configConCiudades(ciudades: Ciudad[], unidad: "c" | "f" = "c"): Config {
  return { ciudadDefault: null, ciudades, unidad };
}

export const climaEjemplo: ClimaActual = {
  hora: "2026-10-14 12:00",
  temperatura: 25,
  sensacion: 26,
  humedad: 40,
  viento: 10,
  codigoClima: 0,
  unidadTemperatura: "°C",
};

export const pronosticoEjemplo: Pronostico = {
  dias: [
    { fecha: "2026-10-14", codigoClima: 0, tempMax: 25, tempMin: 12, probLluvia: 0, vientoMax: 10 },
    { fecha: "2026-10-15", codigoClima: 61, tempMax: 20, tempMin: 11, probLluvia: 60, vientoMax: 15 },
    { fecha: "2026-10-16", codigoClima: 3, tempMax: 18, tempMin: 10, probLluvia: 20, vientoMax: 12 },
    { fecha: "2026-10-17", codigoClima: 71, tempMax: 5, tempMin: -1, probLluvia: 80, vientoMax: 20 },
    { fecha: "2026-10-18", codigoClima: 95, tempMax: 16, tempMin: 9, probLluvia: 95, vientoMax: 30 },
    { fecha: "2026-10-19", codigoClima: 45, tempMax: 14, tempMin: 8, probLluvia: 10, vientoMax: 6 },
    { fecha: "2026-10-20", codigoClima: 1, tempMax: 22, tempMin: 13, probLluvia: 5, vientoMax: 9 },
  ],
  unidadTemperatura: "°C",
};

export function payloadGeocoding(nombres: string[]): unknown {
  return {
    results: nombres.map((nombre, i) => ({
      id: i + 1,
      name: nombre,
      latitude: 10 + i,
      longitude: 20 + i,
      country: "País",
      admin1: "Región",
    })),
  };
}

export const payloadClima = {
  current: {
    time: "2026-10-14T12:00",
    temperature_2m: 21.5,
    relative_humidity_2m: 55,
    apparent_temperature: 20.9,
    weather_code: 1,
    wind_speed_10m: 12.3,
  },
  current_units: { temperature_2m: "°C" },
};

export const payloadPronostico = {
  daily: {
    time: [
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
      "2026-10-19",
      "2026-10-20",
    ],
    weather_code: [0, 1, 3, 61, 80, 95, 45],
    temperature_2m_max: [25, 24, 22, 20, 19, 18, 17],
    temperature_2m_min: [12, 11, 10, 9, 8, 7, 6],
    precipitation_probability_max: [0, 10, 20, 60, 70, 90, 5],
    wind_speed_10m_max: [10, 12, 14, 16, 18, 20, 8],
  },
  daily_units: { temperature_2m_max: "°C" },
};
