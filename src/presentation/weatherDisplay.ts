import type { ClimaActual, Pronostico } from "../types/Weather";
import type { Ciudad } from "../types/City";
import { azul, cian, colorClima, colorTemperatura, dim, gris, negrita } from "../utils/colors";
import { descripcionClima, etiquetaCiudad, fechaCorta, num, truncar } from "../utils/format";

function fila(etiqueta: string, valor: string): string {
  return `  ${dim(etiqueta.padEnd(14))}${valor}`;
}

export function pintarClima(ciudad: Ciudad, clima: ClimaActual): void {
  const titulo = etiquetaCiudad(ciudad);
  console.log("");
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
}
