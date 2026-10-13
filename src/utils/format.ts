import type { Ciudad } from "../types/City";
import { CODIGOS_WMO } from "./constants";

export function descripcionClima(codigo: number): string {
  return CODIGOS_WMO[codigo] ?? `Clima desconocido (código ${codigo})`;
}

export function etiquetaCiudad(ciudad: Ciudad): string {
  return [ciudad.nombre, ciudad.region, ciudad.pais]
    .filter((parte): parte is string => typeof parte === "string" && parte.length > 0)
    .join(", ");
}

export function num(valor: number): string {
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

export function fechaCorta(fecha: string): string {
  const f = new Date(`${fecha}T00:00:00Z`);
  if (Number.isNaN(f.getTime())) return fecha;
  const dia = f
    .toLocaleDateString("es-ES", { weekday: "short", timeZone: "UTC" })
    .replace(".", "");
  const resto = f.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
  return `${dia} ${resto}`;
}

export function truncar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}
