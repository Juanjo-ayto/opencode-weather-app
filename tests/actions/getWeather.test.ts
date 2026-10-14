import { afterEach, describe, expect, test } from "bun:test";
import { climaCiudadDefault, climaTodasCiudades } from "../../src/actions/getWeather";
import { sinAnsi } from "../helpers/ansi";
import {
  configConCiudades,
  configVacia,
  madrid,
  otawa,
  paris,
  payloadClima,
} from "../helpers/fixtures";
import {
  espiarConsola,
  instalarFetch,
  respuestaJson,
  type ConsolaEspiada,
  type FetchFalso,
} from "../helpers/mocks";

let consola: ConsolaEspiada | undefined;
let fetchFalso: FetchFalso | undefined;

afterEach(() => {
  consola?.restaurar();
  fetchFalso?.restaurar();
  consola = undefined;
  fetchFalso = undefined;
});

const visibles = (): string[] => (consola?.lineas ?? []).map(sinAnsi);

describe("climaCiudadDefault", () => {
  test("sin ciudad default avisa y no consulta la API", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    await climaCiudadDefault(configVacia());
    expect(visibles()).toEqual([
      "  No hay ciudad por defecto. Usa la opción 5 para establecer una.",
    ]);
    expect(fetchFalso.urls).toEqual([]);
  });

  test("con default muestra la ficha del clima", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => respuestaJson(payloadClima));
    const config = configVacia();
    config.ciudadDefault = madrid;
    await climaCiudadDefault(config);
    expect(fetchFalso.urls).toHaveLength(1);
    expect(visibles()[1]).toBe("  Madrid, Madrid, España");
    expect(visibles()).toContain("  Temperatura   21,5 °C");
  });

  test("si la API falla muestra el error con el nombre de la ciudad", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => respuestaJson({}, 500));
    const config = configVacia();
    config.ciudadDefault = madrid;
    await climaCiudadDefault(config);
    expect(visibles()).toEqual([
      "  No se pudo obtener el clima de Madrid: la API devolvió HTTP 500.",
    ]);
  });
});

describe("climaTodasCiudades", () => {
  test("sin ciudades avisa y no consulta la API", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    await climaTodasCiudades(configVacia());
    expect(visibles()).toEqual([
      "  Todavía no hay ciudades guardadas. Usa la opción 3 para agregar una.",
    ]);
    expect(fetchFalso.urls).toEqual([]);
  });

  test("muestra una ficha por ciudad empezando por la default y acaba en blanco", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => respuestaJson(payloadClima));
    const config = configConCiudades([paris, otawa]);
    config.ciudadDefault = madrid;
    await climaTodasCiudades(config);
    expect(fetchFalso.urls).toHaveLength(3);
    const vis = visibles();
    expect(vis.filter((l) => l === "  Madrid, Madrid, España")).toHaveLength(1);
    expect(vis.filter((l) => l === "  París, Île-de-France, Francia")).toHaveLength(1);
    expect(vis.filter((l) => l === "  Ottawa, Ontario, Canadá")).toHaveLength(1);
    expect(vis[vis.length - 1]).toBe("");
  });

  test("un error en una ciudad no detiene las demás", async () => {
    consola = espiarConsola();
    let llamada = 0;
    fetchFalso = instalarFetch(() => {
      llamada += 1;
      return llamada === 1 ? respuestaJson({}, 500) : respuestaJson(payloadClima);
    });
    const config = configConCiudades([paris]);
    config.ciudadDefault = madrid;
    await climaTodasCiudades(config);
    const vis = visibles();
    expect(vis).toContain(
      "  No se pudo obtener el clima de Madrid: la API devolvió HTTP 500.",
    );
    expect(vis).toContain("  París, Île-de-France, Francia");
    expect(fetchFalso.urls).toHaveLength(2);
  });
});
