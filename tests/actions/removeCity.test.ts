import { afterEach, describe, expect, test } from "bun:test";
import { eliminarCiudadDeLaLista } from "../../src/actions/removeCity";
import { leerConfig } from "../../src/storage/configFile";
import { sinAnsi } from "../helpers/ansi";
import { configConCiudades, configVacia, madrid, otawa, paris } from "../helpers/fixtures";
import {
  espiarConsola,
  instalarPrompt,
  type ConsolaEspiada,
  type PromptFalso,
} from "../helpers/mocks";

let consola: ConsolaEspiada | undefined;
let promptFalso: PromptFalso | undefined;

afterEach(() => {
  consola?.restaurar();
  promptFalso?.restaurar();
  consola = undefined;
  promptFalso = undefined;
});

const visibles = (): string[] => (consola?.lineas ?? []).map(sinAnsi);

describe("eliminarCiudadDeLaLista", () => {
  test("sin ciudades guardadas avisa y no pide nada", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt([]);
    const config = configVacia();
    await eliminarCiudadDeLaLista(config);
    expect(visibles()).toEqual(["  No hay ciudades guardadas que eliminar."]);
    expect(promptFalso.mensajes).toEqual([]);
  });

  test("elimina la elegida, persiste y anuncia", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["2"]);
    const config = configConCiudades([paris, otawa]);
    await eliminarCiudadDeLaLista(config);
    expect(config.ciudades).toEqual([paris]);
    expect((await leerConfig()).ciudades).toEqual([paris]);
    expect(visibles()).toEqual(["    1. París, Île-de-France, Francia", "    2. Ottawa, Ontario, Canadá", "  Ciudad eliminada: Ottawa, Ontario, Canadá."]);
  });

  test("una selección inválida no elimina nada", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt(["99"]);
    const config = configConCiudades([paris, otawa]);
    await eliminarCiudadDeLaLista(config);
    expect(config.ciudades).toEqual([paris, otawa]);
    expect(visibles()).toContain("  Selección no válida.");
    expect(visibles().some((l) => l.startsWith("  Ciudad eliminada:"))).toBe(false);
  });

  test("en EOF no elimina nada", async () => {
    consola = espiarConsola();
    promptFalso = instalarPrompt([]);
    const config = configConCiudades([madrid]);
    await eliminarCiudadDeLaLista(config);
    expect(config.ciudades).toEqual([madrid]);
    expect(visibles()).toContain("  Selección no válida.");
  });
});
