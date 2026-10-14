import { afterEach, describe, expect, test } from "bun:test";
import { buscarCiudades } from "../../src/api/geocoding";
import { URL_GEOCODING } from "../../src/utils/constants";
import { instalarFetch, respuestaJson, type FetchFalso } from "../helpers/mocks";

let fetchFalso: FetchFalso | undefined;

afterEach(() => {
  fetchFalso?.restaurar();
  fetchFalso = undefined;
});

describe("buscarCiudades", () => {
  test("construye la URL del README con el nombre codificado", async () => {
    fetchFalso = instalarFetch(() => respuestaJson({}));
    await buscarCiudades("San José");
    expect(fetchFalso.urls).toEqual([
      `${URL_GEOCODING}?name=San%20Jos%C3%A9&count=5&language=es&format=json`,
    ]);
  });

  test("mapea los resultados de la API a Ciudad", async () => {
    fetchFalso = instalarFetch(() =>
      respuestaJson({
        results: [
          { id: 1, name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá", admin1: "Ontario" },
          { id: 2, name: "Lima", latitude: -12.0464, longitude: -77.0428 },
        ],
      }),
    );
    expect(await buscarCiudades("Ottawa")).toEqual([
      { nombre: "Ottawa", lat: 45.41117, lon: -75.69812, pais: "Canadá", region: "Ontario" },
      { nombre: "Lima", lat: -12.0464, lon: -77.0428, pais: undefined, region: undefined },
    ]);
  });

  test("devuelve vacío si la API no trae results", async () => {
    fetchFalso = instalarFetch(() => respuestaJson({}));
    expect(await buscarCiudades("Inexistente")).toEqual([]);

    fetchFalso = instalarFetch(() => respuestaJson({ results: [] }));
    expect(await buscarCiudades("Inexistente")).toEqual([]);
  });

  test("propaga el error si la API devuelve HTTP 500", async () => {
    fetchFalso = instalarFetch(() => respuestaJson({}, 500));
    await expect(buscarCiudades("Ottawa")).rejects.toThrow("la API devolvió HTTP 500");
  });
});
