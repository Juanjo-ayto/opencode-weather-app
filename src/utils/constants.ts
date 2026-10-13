import type { Config } from "../types/Config";

export const URL_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";

export const URL_FORECAST = "https://api.open-meteo.com/v1/forecast";

export const ANCHO_MENU = 40;

export const CONFIG_VACIA: Config = { ciudadDefault: null, ciudades: [], unidad: "c" };

export const CODIGOS_WMO: Record<number, string> = {
  0: "Despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  66: "Lluvia helada ligera",
  67: "Lluvia helada intensa",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos intensos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve intensos",
  95: "Tormenta",
  96: "Tormenta con granizo ligera",
  99: "Tormenta con granizo intensa",
};
