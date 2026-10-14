import { afterEach, describe, expect, test } from "bun:test";
import { buscarYAgregarCiudad } from "../../src/actions/addCity";
import { leerConfig } from "../../src/storage/configFile";
import { sinAnsi } from "../helpers/ansi";
import { configConCiudades, configVacia, madrid } from "../helpers/fixtures";
import {
  espiarConsola,
  instalarFetch,
  instalarPrompt,
  respuestaJson,
  type ConsolaEspiada,
  type FetchFalso,
  type PromptFalso,
} from "../helpers/mocks";

const ottawaBuscada = { nombre: "Ottawa", lat: 10, lon: 20, pais: "País", region: "Región" };

function geocodingOttawa() {
  return respuestaJson({
    results: [
      { id: 1, name: "Ottawa", latitude: 10, longitude: 20, country: "País", admin1: "Región" },
    ],
  });
}

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

describe("buscarYAgregarCiudad", () => {
  test("búsqueda cancelada no agrega ni escribe nada", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt([""]);
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    const config = configVacia();
    await buscarYAgregarCiudad(config);
    expect(config.ciudades).toEqual([]);
    expect(visibles()).toContain("  Búsqueda cancelada.");
    expect(visibles().some((l) => l.startsWith("  Ciudad agregada:"))).toBe(false);
  });

  test("agrega una ciudad nueva y la persiste", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["Ottawa"]);
    fetchFalso = instalarFetch(geocodingOttawa);
    const config = configVacia();
    await buscarYAgregarCiudad(config);
    expect(config.ciudades).toEqual([ottawaBuscada]);
    expect(await leerConfig()).toEqual(config);
    expect(visibles()).toContain("  Ciudad agregada: Ottawa, Región, País.");
  });

  test("avisa si la ciudad ya está en la lista", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["Ottawa"]);
    fetchFalso = instalarFetch(geocodingOttawa);
    const config = configConCiudades([ottawaBuscada]);
    await buscarYAgregarCiudad(config);
    expect(config.ciudades).toHaveLength(1);
    expect(visibles()).toContain('  "Ottawa, Región, País" ya existe y ya está en la lista.');
  });

  test("avisa si la ciudad ya es la default", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["Ottawa"]);
    fetchFalso = instalarFetch(geocodingOttawa);
    const config = configConCiudades([madrid]);
    config.ciudadDefault = ottawaBuscada;
    await buscarYAgregarCiudad(config);
    expect(config.ciudades).toHaveLength(1);
    expect(visibles()).toContain('  "Ottawa, Región, País" ya existe y ya es la ciudad por defecto.');
  });

  test("no duplica cuando la búsqueda no devuelve resultados", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["Nada"]);
    fetchFalso = instalarFetch(() => respuestaJson({}));
    const config = configVacia();
    await buscarYAgregarCiudad(config);
    expect(config.ciudades).toEqual([]);
    expect(visibles()).toContain('  No se encontraron resultados para "Nada".');
  });
});
