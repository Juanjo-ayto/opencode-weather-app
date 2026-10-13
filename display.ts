import type { ClimaActual } from "./api";
import type { Ciudad } from "./types";

const CODIGOS_WMO: Record<number, string> = {
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

export function descripcionClima(codigo: number): string {
  return CODIGOS_WMO[codigo] ?? `Clima desconocido (código ${codigo})`;
}

export function etiquetaCiudad(ciudad: Ciudad): string {
  return [ciudad.nombre, ciudad.region, ciudad.pais]
    .filter((parte): parte is string => typeof parte === "string" && parte.length > 0)
    .join(", ");
}

function num(valor: number): string {
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

function fila(etiqueta: string, valor: string): string {
  return `  ${etiqueta.padEnd(14)}${valor}`;
}

export function pintarClima(ciudad: Ciudad, clima: ClimaActual): void {
  const titulo = etiquetaCiudad(ciudad);
  console.log("");
  console.log(`  ${titulo}`);
  console.log(`  ${"─".repeat(Math.max(titulo.length, 34))}`);
  console.log(fila("Estado", descripcionClima(clima.codigoClima)));
  console.log(fila("Temperatura", `${num(clima.temperatura)} ${clima.unidadTemperatura}`));
  console.log(fila("Sensación", `${num(clima.sensacion)} ${clima.unidadTemperatura}`));
  console.log(fila("Humedad", `${num(clima.humedad)} %`));
  console.log(fila("Viento", `${num(clima.viento)} km/h`));
  console.log(fila("Hora local", clima.hora));
}
