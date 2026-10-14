import { afterEach, describe, expect, test } from "bun:test";
import { establecerCiudadDefault } from "../../src/actions/setDefaultCity";
import { leerConfig } from "../../src/storage/configFile";
import { sinAnsi } from "../helpers/ansi";
import { configConCiudades, configVacia, madrid, otawa, paris } from "../helpers/fixtures";
import {
  espiarConsola,
  instalarFetch,
  instalarPrompt,
  respuestaJson,
  type ConsolaEspiada,
  type FetchFalso,
  type PromptFalso,
} from "../helpers/mocks";

let consola: ConsolaEspiada | undefined;
let fetchFalso: FetchFalso | undefined;
let promptFalso: PromptFalso | undefined;

afterEach(() => {
  consola?.restaurar();
  fetchFalso?.restaurar();
  promptFalso?.restaurar();
  consola = undefined;
  fetchFalso = undefined;
  promptFalso = undefined;
});

const visibles = (): string[] => (consola?.lineas ?? []).map(sinAnsi);

describe("establecerCiudadDefault", () => {
  test("sin ciudades guardadas busca directamente en la API", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["Ottawa"]);
    fetchFalso = instalarFetch(() =>
      respuestaJson({
        results: [
          { id: 1, name: "Ottawa", latitude: 45.4, longitude: -75.6, country: "Canadá", admin1: "Ontario" },
        ],
      }),
    );
    const config = configVacia();
    await establecerCiudadDefault(config);
    expect(config.ciudadDefault).toEqual({
      nombre: "Ottawa",
      lat: 45.4,
      lon: -75.6,
      pais: "Canadá",
      region: "Ontario",
    });
    expect((await leerConfig()).ciudadDefault).toEqual(config.ciudadDefault);
    expect(visibles()).toContain("  Ciudad por defecto establecida: Ottawa, Ontario, Canadá.");
  });

  test("lista las ciudades con la opción 0 de buscar nueva", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["99"]);
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    const config = configConCiudades([paris, otawa]);
    await establecerCiudadDefault(config);
    expect(visibles()).toEqual([
      "  Ciudades guardadas:",
      "    1. París, Île-de-France, Francia",
      "    2. Ottawa, Ontario, Canadá",
      "    0. Buscar una ciudad nueva",
      "  Selección no válida.",
    ]);
    expect(fetchFalso.urls).toEqual([]);
    expect(config.ciudadDefault).toBeNull();
  });

  test("promueve una ciudad de la lista quitándola de ciudades", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["1"]);
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    const config = configConCiudades([paris, otawa]);
    await establecerCiudadDefault(config);
    expect(config.ciudadDefault).toEqual(paris);
    expect(config.ciudades).toEqual([otawa]);
    expect((await leerConfig()).ciudadDefault).toEqual(paris);
    expect(visibles()).toContain("  Ciudad por defecto establecida: París, Île-de-France, Francia.");
  });

  test("la opción 0 busca una ciudad nueva sin tocar la lista", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["0", "Ottawa"]);
    fetchFalso = instalarFetch(() =>
      respuestaJson({
        results: [
          { id: 1, name: "Ottawa", latitude: 45.4, longitude: -75.6, country: "Canadá", admin1: "Ontario" },
        ],
      }),
    );
    const config = configConCiudades([madrid, paris]);
    await establecerCiudadDefault(config);
    expect(config.ciudadDefault?.nombre).toBe("Ottawa");
    expect(config.ciudades).toEqual([madrid, paris]);
    expect(visibles()).toContain("  Ciudad por defecto establecida: Ottawa, Ontario, Canadá.");
  });

  test("selección no numérica avisa y no cambia nada", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["abc"]);
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    const config = configConCiudades([madrid]);
    await establecerCiudadDefault(config);
    expect(config.ciudadDefault).toBeNull();
    expect(config.ciudades).toEqual([madrid]);
    expect(visibles()).toContain("  Selección no válida.");
  });

  test("cancelar la búsqueda de ciudad nueva no cambia nada", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["0", ""]);
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    const config = configConCiudades([madrid]);
    await establecerCiudadDefault(config);
    expect(config.ciudadDefault).toBeNull();
    expect(config.ciudades).toEqual([madrid]);
    expect(fetchFalso.urls).toEqual([]);
    expect(visibles()).toContain("  Búsqueda cancelada.");
    expect(visibles().some((l) => l.startsWith("  Ciudad por defecto establecida:"))).toBe(false);
  });
});
