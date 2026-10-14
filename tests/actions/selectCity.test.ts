import { afterEach, describe, expect, test } from "bun:test";
import { elegirCiudad, elegirDeLista } from "../../src/actions/selectCity";
import { sinAnsi } from "../helpers/ansi";
import { madrid, otawa, paris } from "../helpers/fixtures";
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

describe("elegirDeLista", () => {
  test("lista las ciudades y devuelve la elegida", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["2"]);
    expect(await elegirDeLista([madrid, paris], "  ¿Cuál eliminar? ")).toEqual(paris);
    expect(visibles()).toEqual(["    1. Madrid, Madrid, España", "    2. París, Île-de-France, Francia"]);
    expect(promptFalso.mensajes).toEqual(["  ¿Cuál eliminar? "]);
  });

  test("rechaza opciones fuera de rango o no numéricas", async () => {
    for (const entrada of ["0", "99", "abc", "1.5"]) {
      consola = espiarConsola();
      promptFalso = instalarPrompt([entrada]);
      expect(await elegirDeLista([madrid], "  ¿Cuál? ")).toBeNull();
      expect(visibles()).toContain("  Selección no válida.");
      consola.restaurar();
      promptFalso.restaurar();
    }
  });

  test("en EOF devuelve null con aviso", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt([]);
    expect(await elegirDeLista([madrid], "  ¿Cuál? ")).toBeNull();
    expect(visibles()).toContain("  Selección no válida.");
  });
});

describe("elegirCiudad", () => {
  test("entrada vacía cancela la búsqueda sin consultar la API", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt([""]);
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    expect(await elegirCiudad()).toBeNull();
    expect(visibles()).toContain("  Búsqueda cancelada.");
    expect(fetchFalso.urls).toEqual([]);
  });

  test("entrada null (EOF) cancela la búsqueda", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt([null]);
    expect(await elegirCiudad()).toBeNull();
    expect(visibles()).toContain("  Búsqueda cancelada.");
  });

  test("con un único resultado lo devuelve directamente", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["Ottawa"]);
    fetchFalso = instalarFetch(() =>
      respuestaJson({
        results: [
          { id: 1, name: "Ottawa", latitude: 45.4, longitude: -75.6, country: "Canadá", admin1: "Ontario" },
        ],
      }),
    );
    expect(await elegirCiudad()).toEqual({
      nombre: "Ottawa",
      lat: 45.4,
      lon: -75.6,
      pais: "Canadá",
      region: "Ontario",
    });
    expect(fetchFalso.urls[0]).toContain("name=Ottawa");
    expect(visibles()).toEqual([]);
  });

  test("sin resultados avisa y devuelve null", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["Ninguna"]);
    fetchFalso = instalarFetch(() => respuestaJson({}));
    expect(await elegirCiudad()).toBeNull();
    expect(visibles()).toContain('  No se encontraron resultados para "Ninguna".');
  });

  test("si la API falla muestra el error de geocoding", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["Ottawa"]);
    fetchFalso = instalarFetch(() => respuestaJson({}, 500));
    expect(await elegirCiudad()).toBeNull();
    expect(visibles()).toContain(
      "  No se pudo consultar la API de geocoding: la API devolvió HTTP 500.",
    );
  });

  test("con varios resultados permite elegir uno", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["ciudad", "2"]);
    fetchFalso = instalarFetch(() =>
      respuestaJson({
        results: [
          { id: 1, name: "Roma", latitude: 1, longitude: 2 },
          { id: 2, name: "Lima", latitude: 3, longitude: 4 },
          { id: 3, name: "Oslo", latitude: 5, longitude: 6 },
        ],
      }),
    );
    const elegida = await elegirCiudad();
    expect(elegida?.nombre).toBe("Lima");
    expect(visibles()[0]).toBe("  Elige un resultado:");
    expect(visibles()).toContain("    1. Roma");
    expect(visibles()).toContain("    2. Lima");
    expect(visibles()).toContain("    3. Oslo");
    expect(visibles()).toContain("    0. Cancelar");
  });

  test("con varios resultados la opción 0 cancela", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["ciudad", "0"]);
    fetchFalso = instalarFetch(() =>
      respuestaJson({
        results: [
          { id: 1, name: "Roma", latitude: 1, longitude: 2 },
          { id: 2, name: "Lima", latitude: 3, longitude: 4 },
        ],
      }),
    );
    expect(await elegirCiudad()).toBeNull();
    expect(visibles()).not.toContain("  Selección no válida.");
  });

  test("con varios resultados una selección inválida avisa", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["ciudad", "9"]);
    fetchFalso = instalarFetch(() =>
      respuestaJson({
        results: [
          { id: 1, name: "Roma", latitude: 1, longitude: 2 },
          { id: 2, name: "Lima", latitude: 3, longitude: 4 },
        ],
      }),
    );
    expect(await elegirCiudad()).toBeNull();
    expect(visibles()).toContain("  Selección no válida.");
  });
});
