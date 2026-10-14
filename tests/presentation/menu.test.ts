import { afterEach, describe, expect, test } from "bun:test";
import { pintarMenu } from "../../src/presentation/menu";
import { sinAnsi } from "../helpers/ansi";
import { espiarConsola, type ConsolaEspiada } from "../helpers/mocks";

let consola: ConsolaEspiada | undefined;

afterEach(() => {
  consola?.restaurar();
  consola = undefined;
});

function caja(total: string, ajustes: string): string[] {
  const linea = "═".repeat(40);
  return [
    linea,
    "         WEATHER CLI",
    linea,
    "  1. Clima de ciudad default",
    `  2. Clima de todas las ciudades (${total})`,
    "  3. Buscar y agregar ciudad",
    "  4. Eliminar ciudad",
    "  5. Establecer ciudad default",
    "  6. Pronóstico 7 días (ciudad default)",
    `  7. Pronóstico 7 días de todas las ciudades (${total})`,
    `  8. Ajustes (${ajustes})`,
    "  9. Salir",
    linea,
  ];
}

describe("pintarMenu", () => {
  test("dibuja exactamente la caja del README en °C", () => {
    consola = espiarConsola();
    pintarMenu("c", 3);
    const lineas = consola.lineas.map(sinAnsi);
    expect(lineas).toEqual(caja("3", "°C"));
  });

  test("cambia los ajustes y el total en °F sin ciudades", () => {
    consola = espiarConsola();
    pintarMenu("f", 0);
    const lineas = consola.lineas.map(sinAnsi);
    expect(lineas).toEqual(caja("0", "°F"));
  });

  test("mantiene los códigos de color en la salida", () => {
    consola = espiarConsola();
    pintarMenu("c", 1);
    expect(consola.lineas.length).toBe(13);
    expect(consola.lineas[1]).toContain("\x1b[33m");
    expect(consola.lineas[0]).toContain("\x1b[36m");
    expect(consola.lineas[1]).toContain("WEATHER CLI");
  });
});
