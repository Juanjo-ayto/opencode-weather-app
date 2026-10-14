import { afterEach, describe, expect, test } from "bun:test";
import { pedirJson } from "../../src/api/client";
import { instalarFetch, respuestaJson, type FetchFalso } from "../helpers/mocks";

let fetchFalso: FetchFalso | undefined;

afterEach(() => {
  fetchFalso?.restaurar();
  fetchFalso = undefined;
});

describe("pedirJson", () => {
  test("devuelve el JSON parseado cuando la respuesta es OK", async () => {
    fetchFalso = instalarFetch(() => respuestaJson({ hola: "mundo" }));
    expect(await pedirJson("https://ejemplo.com/api")).toEqual({ hola: "mundo" });
    expect(fetchFalso.urls).toEqual(["https://ejemplo.com/api"]);
  });

  test("lanza error con el código HTTP si la API falla", async () => {
    fetchFalso = instalarFetch(() => respuestaJson({ error: "boom" }, 500));
    await expect(pedirJson("https://ejemplo.com/api")).rejects.toThrow("la API devolvió HTTP 500");
  });

  test("lanza error de conexión si fetch rechaza", async () => {
    fetchFalso = instalarFetch(() => {
      throw new TypeError("Failed to fetch");
    });
    await expect(pedirJson("https://ejemplo.com/api")).rejects.toThrow("sin conexión (Failed to fetch)");
  });
});
