import { afterEach, describe, expect, test } from "bun:test";
import { aviso, bienvenida, despedida, error, exito, mensajeError } from "../../src/presentation/output";
import { sinAnsi } from "../helpers/ansi";
import { espiarConsola, type ConsolaEspiada } from "../helpers/mocks";

let consola: ConsolaEspiada | undefined;

afterEach(() => {
  consola?.restaurar();
  consola = undefined;
});

describe("mensajeError", () => {
  test("extrae el mensaje de un Error", () => {
    expect(mensajeError(new Error("algo falló"))).toBe("algo falló");
  });

  test("convierte cualquier otra cosa a string", () => {
    expect(mensajeError("texto")).toBe("texto");
    expect(mensajeError(42)).toBe("42");
    expect(mensajeError({ a: 1 })).toBe("[object Object]");
  });
});

describe("error / exito / aviso", () => {
  test("error imprime en rojo con dos espacios de sangría", () => {
    consola = espiarConsola();
    error("mal");
    expect(consola.lineas).toEqual(["\x1b[31m  mal\x1b[39m"]);
  });

  test("exito imprime en verde con dos espacios de sangría", () => {
    consola = espiarConsola();
    exito("bien");
    expect(consola.lineas).toEqual(["\x1b[32m  bien\x1b[39m"]);
  });

  test("aviso imprime en amarillo con dos espacios de sangría", () => {
    consola = espiarConsola();
    aviso("cuidado");
    expect(consola.lineas).toEqual(["\x1b[33m  cuidado\x1b[39m"]);
  });

  test("el texto visible es el mismo con o sin color", () => {
    consola = espiarConsola();
    error("mal");
    exito("bien");
    aviso("cuidado");
    expect(consola.lineas.map(sinAnsi)).toEqual(["  mal", "  bien", "  cuidado"]);
  });
});

describe("bienvenida", () => {
  test("saluda y menciona la ruta de configuración", () => {
    consola = espiarConsola();
    bienvenida();
    expect(consola.lineas).toHaveLength(1);
    const visible = sinAnsi(consola.lineas[0] ?? "");
    expect(visible).toContain("Bienvenido a Weather CLI.");
    expect(visible).toContain("Configuración en ~/.weather-cli.json");
  });
});

describe("despedida", () => {
  test("despide con sangría de dos espacios", () => {
    consola = espiarConsola();
    despedida();
    expect(sinAnsi(consola.lineas[0] ?? "")).toBe("  ¡Hasta luego!");
    expect(consola.lineas[0]?.startsWith("  \x1b[1m\x1b[36m")).toBe(true);
  });

  test("con salto inicial empieza por un salto de línea", () => {
    consola = espiarConsola();
    despedida(true);
    expect(sinAnsi(consola.lineas[0] ?? "")).toBe("\n  ¡Hasta luego!");
  });
});
