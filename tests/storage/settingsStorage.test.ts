import { describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { RUTA_CONFIG, leerConfig } from "../../src/storage/configFile";
import { cargarConfig, cambiarUnidad, guardarConfig } from "../../src/storage/settingsStorage";
import { configVacia, madrid } from "../helpers/fixtures";

describe("cambiarUnidad", () => {
  test("alterna entre c y f", () => {
    expect(cambiarUnidad("c")).toBe("f");
    expect(cambiarUnidad("f")).toBe("c");
  });
});

describe("cargarConfig / guardarConfig", () => {
  test("roundtrip por el fichero temporal", async () => {
    rmSync(RUTA_CONFIG, { force: true });
    expect(await cargarConfig()).toEqual({ ciudadDefault: null, ciudades: [], unidad: "c" });

    const config = { ...configVacia(), ciudadDefault: madrid, unidad: "f" as const };
    await guardarConfig(config);
    expect(await cargarConfig()).toEqual(config);
    expect(await leerConfig()).toEqual(config);
  });
});
