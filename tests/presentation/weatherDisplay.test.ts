import { afterEach, describe, expect, test } from "bun:test";
import { pintarClima, pintarPronostico } from "../../src/presentation/weatherDisplay";
import { sinAnsi } from "../helpers/ansi";
import { climaEjemplo, madrid, pronosticoEjemplo } from "../helpers/fixtures";
import { espiarConsola, type ConsolaEspiada } from "../helpers/mocks";

let consola: ConsolaEspiada | undefined;

afterEach(() => {
  consola?.restaurar();
  consola = undefined;
});

describe("pintarClima", () => {
  test("dibuja la cabecera con la etiqueta de la ciudad", () => {
    consola = espiarConsola();
    pintarClima(madrid, climaEjemplo);
    expect(sinAnsi(consola.lineas[1] ?? "")).toBe("  Madrid, Madrid, España");
    expect(sinAnsi(consola.lineas[2] ?? "")).toBe(`  ${"─".repeat(34)}`);
  });

  test("dibuja las columnas alineadas con los valores", () => {
    consola = espiarConsola();
    pintarClima(madrid, climaEjemplo);
    const visibles = consola.lineas.map(sinAnsi);
    expect(visibles).toEqual([
      "",
      "  Madrid, Madrid, España",
      `  ${"─".repeat(34)}`,
      "  Estado        Despejado",
      "  Temperatura   25 °C",
      "  Sensación     26 °C",
      "  Humedad       40 %",
      "  Viento        10 km/h",
      "  Hora local    2026-10-14 12:00",
    ]);
  });

  test("usa los colores de temperatura y clima", () => {
    consola = espiarConsola();
    pintarClima(madrid, climaEjemplo);
    expect(consola.lineas[4]).toContain("\x1b[38;5;208m");
    expect(consola.lineas[3]).toContain("\x1b[33m");
    expect(consola.lineas[6]).toContain("\x1b[36m");
    expect(consola.lineas[7]).toContain("\x1b[94m");
  });

  test("respeta el formato con decimales y unidad de la API", () => {
    consola = espiarConsola();
    pintarClima(madrid, { ...climaEjemplo, temperatura: 21.5, unidadTemperatura: "°F" });
    expect(sinAnsi(consola.lineas[4] ?? "")).toBe("  Temperatura   21,5 °F");
  });
});

describe("pintarPronostico", () => {
  test("dibuja cabecera, 7 filas y sus fechas", () => {
    consola = espiarConsola();
    pintarPronostico(madrid, pronosticoEjemplo);
    const visibles = consola.lineas.map(sinAnsi);
    expect(visibles[1]).toBe("  Madrid, Madrid, España · próximos 7 días");
    expect(visibles[3]).toBe(
      "  Fecha       Estado                   Máx     Mín   Lluvia     Viento",
    );
    expect(visibles).toHaveLength(3 + 1 + 7);
    for (const fecha of ["14/10", "15/10", "16/10", "17/10", "18/10", "19/10", "20/10"]) {
      expect(visibles.some((l) => l.includes(fecha))).toBe(true);
    }
  });

  test("dibuja los valores de la primera fila", () => {
    consola = espiarConsola();
    pintarPronostico(madrid, pronosticoEjemplo);
    const primera = consola.lineas.map(sinAnsi)[4] ?? "";
    expect(primera).toContain("Despejado");
    expect(primera).toContain("25°C");
    expect(primera).toContain("12°C");
    expect(primera).toContain("0 %");
    expect(primera).toContain("10 km/h");
  });

  test("con la unidad en Fahrenheit usa °F", () => {
    consola = espiarConsola();
    pintarPronostico(madrid, { ...pronosticoEjemplo, unidadTemperatura: "°F" });
    expect(consola.lineas.map(sinAnsi)[4]).toContain("25°F");
  });

  test("sin días muestra el aviso de sin datos", () => {
    consola = espiarConsola();
    pintarPronostico(madrid, { dias: [], unidadTemperatura: "°C" });
    expect(consola.lineas.map(sinAnsi)).toEqual([
      "",
      "  Madrid, Madrid, España · próximos 7 días",
      `  ${"─".repeat(66)}`,
      "  Sin datos de pronóstico.",
    ]);
  });
});
