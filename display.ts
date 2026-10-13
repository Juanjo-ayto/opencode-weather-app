<<<<<<< HEAD
import type { ClimaActual } from "./api";
import type { Ciudad } from "./types";
=======
import type { ClimaActual, Pronostico } from "./api";
import type { Ciudad } from "./types";
import { azul, cian, colorClima, colorTemperatura, dim, gris, negrita } from "./color";
>>>>>>> 02-forecast

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
<<<<<<< HEAD
  return `  ${etiqueta.padEnd(14)}${valor}`;
=======
  return `  ${dim(etiqueta.padEnd(14))}${valor}`;
>>>>>>> 02-forecast
}

export function pintarClima(ciudad: Ciudad, clima: ClimaActual): void {
  const titulo = etiquetaCiudad(ciudad);
  console.log("");
<<<<<<< HEAD
  console.log(`  ${titulo}`);
  console.log(`  ${"─".repeat(Math.max(titulo.length, 34))}`);
  console.log(fila("Estado", descripcionClima(clima.codigoClima)));
  console.log(fila("Temperatura", `${num(clima.temperatura)} ${clima.unidadTemperatura}`));
  console.log(fila("Sensación", `${num(clima.sensacion)} ${clima.unidadTemperatura}`));
  console.log(fila("Humedad", `${num(clima.humedad)} %`));
  console.log(fila("Viento", `${num(clima.viento)} km/h`));
  console.log(fila("Hora local", clima.hora));
=======
  console.log(`  ${negrita(cian(titulo))}`);
  console.log(`  ${dim("─".repeat(Math.max(titulo.length, 34)))}`);
  console.log(
    fila("Estado", colorClima(clima.codigoClima)(negrita(descripcionClima(clima.codigoClima)))),
  );
  console.log(
    fila(
      "Temperatura",
      colorTemperatura(clima.temperatura, clima.unidadTemperatura)(
        `${num(clima.temperatura)} ${clima.unidadTemperatura}`,
      ),
    ),
  );
  console.log(
    fila(
      "Sensación",
      colorTemperatura(clima.sensacion, clima.unidadTemperatura)(
        `${num(clima.sensacion)} ${clima.unidadTemperatura}`,
      ),
    ),
  );
  console.log(fila("Humedad", cian(`${num(clima.humedad)} %`)));
  console.log(fila("Viento", azul(`${num(clima.viento)} km/h`)));
  console.log(fila("Hora local", gris(clima.hora)));
}

function fechaCorta(fecha: string): string {
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

function truncar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

export function pintarPronostico(ciudad: Ciudad, pronostico: Pronostico): void {
  const titulo = etiquetaCiudad(ciudad);
  const u = pronostico.unidadTemperatura;
  console.log("");
  console.log(`  ${negrita(cian(titulo))} ${dim("· próximos 7 días")}`);
  console.log(`  ${dim("─".repeat(Math.max(titulo.length, 66)))}`);
  if (pronostico.dias.length === 0) {
    console.log(dim("  Sin datos de pronóstico."));
    return;
  }
  const cabecera =
    "Fecha".padEnd(12) +
    "Estado".padEnd(20) +
    "Máx".padStart(8) +
    "Mín".padStart(8) +
    "Lluvia".padStart(9) +
    "Viento".padStart(11);
  console.log(`  ${dim(cabecera)}`);
  for (const dia of pronostico.dias) {
    const filaTexto =
      gris(fechaCorta(dia.fecha).padEnd(12)) +
      colorClima(dia.codigoClima)(truncar(descripcionClima(dia.codigoClima), 20).padEnd(20)) +
      colorTemperatura(dia.tempMax, u)(`${num(dia.tempMax)}${u}`.padStart(8)) +
      colorTemperatura(dia.tempMin, u)(`${num(dia.tempMin)}${u}`.padStart(8)) +
      cian(`${num(dia.probLluvia)} %`.padStart(9)) +
      azul(`${num(dia.vientoMax)} km/h`.padStart(11));
    console.log(`  ${filaTexto}`);
  }
>>>>>>> 02-forecast
}
