import { describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import {
  agregarCiudad,
  ciudadExistente,
  eliminarCiudad,
  guardarCiudades,
  totalCiudades,
  todasCiudades,
} from "../../src/storage/citiesStorage";
import { leerConfig, RUTA_CONFIG } from "../../src/storage/configFile";
import { configConCiudades, configVacia, madrid, otawa, paris } from "../helpers/fixtures";

describe("todasCiudades", () => {
  test("con ciudad default la antepone a la lista", () => {
    const config = configConCiudades([paris, otawa]);
    config.ciudadDefault = madrid;
    expect(todasCiudades(config)).toEqual([madrid, paris, otawa]);
  });

  test("sin default devuelve las ciudades guardadas", () => {
    const config = configConCiudades([paris]);
    expect(todasCiudades(config)).toEqual([paris]);
    expect(todasCiudades(config)).toBe(config.ciudades);
  });

  test("sin default y sin ciudades devuelve vacío", () => {
    expect(todasCiudades(configVacia())).toEqual([]);
  });
});

describe("totalCiudades", () => {
  test("cuenta default + lista", () => {
    const config = configConCiudades([paris, otawa]);
    config.ciudadDefault = madrid;
    expect(totalCiudades(config)).toBe(3);
  });

  test("sin default cuenta solo la lista", () => {
    expect(totalCiudades(configConCiudades([paris]))).toBe(1);
    expect(totalCiudades(configVacia())).toBe(0);
  });
});

describe("ciudadExistente", () => {
  test("la default también cuenta como existente", () => {
    const config = configConCiudades([paris]);
    config.ciudadDefault = madrid;
    expect(ciudadExistente(config, { nombre: "Madrid Capital", lat: madrid.lat, lon: madrid.lon })).toEqual(madrid);
    expect(ciudadExistente(config, paris)).toEqual(paris);
  });

  test("devuelve null si las coordenadas no coinciden", () => {
    const config = configConCiudades([paris]);
    expect(ciudadExistente(config, { nombre: "París", lat: 99, lon: 99 })).toBeNull();
    expect(ciudadExistente(configVacia(), madrid)).toBeNull();
  });
});

describe("agregarCiudad", () => {
  test("añade la ciudad a la lista", () => {
    const config = configVacia();
    agregarCiudad(config, madrid);
    agregarCiudad(config, paris);
    expect(config.ciudades).toEqual([madrid, paris]);
  });
});

describe("eliminarCiudad", () => {
  test("elimina solo la ciudad con esas coordenadas", () => {
    const config = configConCiudades([madrid, paris, otawa]);
    eliminarCiudad(config, paris);
    expect(config.ciudades).toEqual([madrid, otawa]);
  });

  test("no toca la ciudad default", () => {
    const config = configConCiudades([paris]);
    config.ciudadDefault = madrid;
    eliminarCiudad(config, madrid);
    expect(config.ciudadDefault).toEqual(madrid);
    expect(config.ciudades).toEqual([paris]);
  });
});

describe("guardarCiudades", () => {
  test("persiste la lista en el fichero de config", async () => {
    rmSync(RUTA_CONFIG, { force: true });
    const config = configConCiudades([madrid, paris]);
    await guardarCiudades(config);
    expect(await leerConfig()).toEqual(config);
  });
});
