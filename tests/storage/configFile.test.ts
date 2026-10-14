import { describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import type { Config } from "../../src/types/Config";
import { CONFIG_VACIA } from "../../src/utils/constants";
import { RUTA_CONFIG, escribirConfig, leerConfig } from "../../src/storage/configFile";

function limpiar(): void {
  rmSync(RUTA_CONFIG, { force: true });
}

describe("RUTA_CONFIG", () => {
  test("apunta dentro del HOME temporal de los tests (nunca al home real)", () => {
    expect(RUTA_CONFIG.startsWith(`${homedir()}/`)).toBe(true);
    expect(RUTA_CONFIG).toContain("weather-cli-test");
    expect(RUTA_CONFIG.endsWith("/.weather-cli.json")).toBe(true);
  });
});

describe("leerConfig", () => {
  test("devuelve la config vacía si el fichero no existe", async () => {
    limpiar();
    expect(await leerConfig()).toEqual({ ciudadDefault: null, ciudades: [], unidad: "c" });
  });

  test("devuelve la config vacía si el JSON es corrupto", async () => {
    await Bun.write(RUTA_CONFIG, "{esto no es json");
    expect(await leerConfig()).toEqual(CONFIG_VACIA);
  });

  test("parsea una config válida completa", async () => {
    const config: Config = {
      ciudadDefault: { nombre: "Madrid", lat: 40.4, lon: -3.7, pais: "España" },
      ciudades: [{ nombre: "París", lat: 48.8, lon: 2.3 }],
      unidad: "f",
    };
    await escribirConfig(config);
    expect(await leerConfig()).toEqual(config);
  });

  test("normaliza la unidad: solo acepta \"f\", el resto es \"c\"", async () => {
    await Bun.write(RUTA_CONFIG, JSON.stringify({ ciudadDefault: null, ciudades: [], unidad: "x" }));
    expect((await leerConfig()).unidad).toBe("c");
    await Bun.write(RUTA_CONFIG, JSON.stringify({ unidad: "f" }));
    expect((await leerConfig()).unidad).toBe("f");
  });

  test("descarta ciudades malformadas y ciudadDefault inválida", async () => {
    await Bun.write(
      RUTA_CONFIG,
      JSON.stringify({
        ciudadDefault: "no soy ciudad",
        ciudades: [
          { nombre: "Válida", lat: 1, lon: 2 },
          { nombre: "Sin lat" },
          { lat: 3, lon: 4 },
          null,
          "texto",
        ],
        unidad: "c",
      }),
    );
    const config = await leerConfig();
    expect(config.ciudadDefault).toBeNull();
    expect(config.ciudades).toEqual([{ nombre: "Válida", lat: 1, lon: 2 }]);
  });
});

describe("escribirConfig", () => {
  test("escribe JSON legible con dos espacios y salto final", async () => {
    const config: Config = { ciudadDefault: null, ciudades: [{ nombre: "X", lat: 1, lon: 2 }], unidad: "c" };
    await escribirConfig(config);
    const texto = await Bun.file(RUTA_CONFIG).text();
    expect(texto.endsWith("\n")).toBe(true);
    expect(texto).toContain("  \"ciudades\"");
    expect(JSON.parse(texto)).toEqual(config);
  });

  test("roundtrip escribir → leer", async () => {
    const config: Config = {
      ciudadDefault: { nombre: "Ottawa", lat: 45.4, lon: -75.7 },
      ciudades: [],
      unidad: "f",
    };
    await escribirConfig(config);
    expect(await leerConfig()).toEqual(config);
  });
});
