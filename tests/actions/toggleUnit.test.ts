import { afterEach, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { alternarUnidad } from "../../src/actions/toggleUnit";
import { RUTA_CONFIG, leerConfig } from "../../src/storage/configFile";
import { sinAnsi } from "../helpers/ansi";
import { configConCiudades, madrid } from "../helpers/fixtures";
import { espiarConsola, type ConsolaEspiada } from "../helpers/mocks";

let consola: ConsolaEspiada | undefined;

afterEach(() => {
  consola?.restaurar();
  consola = undefined;
});

describe("alternarUnidad", () => {
  test("cambia de °C a °F, persiste y anuncia el cambio", async () => {
    rmSync(RUTA_CONFIG, { force: true });
    consola = espiarConsola();
    const config = configConCiudades([madrid], "c");
    await alternarUnidad(config);
    expect(config.unidad).toBe("f");
    expect((await leerConfig()).unidad).toBe("f");
    expect((consola.lineas ?? []).map(sinAnsi)).toEqual([
      "  Unidad de temperatura cambiada a °F.",
    ]);
  });

  test("cambia de °F a °C", async () => {
    consola = espiarConsola();
    const config = configConCiudades([madrid], "f");
    await alternarUnidad(config);
    expect(config.unidad).toBe("c");
    expect((await leerConfig()).unidad).toBe("c");
    expect((consola.lineas ?? []).map(sinAnsi)).toEqual([
      "  Unidad de temperatura cambiada a °C.",
    ]);
  });
});
