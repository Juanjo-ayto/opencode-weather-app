import { afterEach, describe, expect, test } from "bun:test";
import { listarCiudades } from "../../src/actions/listCities";
import { espiarConsola, type ConsolaEspiada } from "../helpers/mocks";
import { madrid, otawa, paris } from "../helpers/fixtures";

let consola: ConsolaEspiada | undefined;

afterEach(() => {
  consola?.restaurar();
  consola = undefined;
});

describe("listarCiudades", () => {
  test("numera las ciudades con sangría de cuatro espacios", () => {
    consola = espiarConsola();
    listarCiudades([madrid, paris, otawa]);
    expect(consola.lineas).toEqual([
      "    1. Madrid, Madrid, España",
      "    2. París, Île-de-France, Francia",
      "    3. Ottawa, Ontario, Canadá",
    ]);
  });

  test("lista vacía no imprime nada", () => {
    consola = espiarConsola();
    listarCiudades([]);
    expect(consola.lineas).toEqual([]);
  });
});
