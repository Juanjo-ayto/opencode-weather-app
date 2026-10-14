import { afterEach, describe, expect, test } from "bun:test";
import { pronosticoCiudadDefault, pronosticoTodasCiudades } from "../../src/actions/getForecast";
import { sinAnsi } from "../helpers/ansi";
import {
  configConCiudades,
  configVacia,
  madrid,
  otawa,
  paris,
  payloadPronostico,
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

describe("pronosticoCiudadDefault", () => {
  test("sin ciudad default avisa y no consulta la API", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    await pronosticoCiudadDefault(configVacia());
    expect(visibles()).toEqual([
      "  No hay ciudad por defecto. Usa la opción 5 para establecer una.",
    ]);
    expect(fetchFalso.urls).toEqual([]);
  });

  test("con default muestra el pronóstico de 7 días", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => respuestaJson(payloadPronostico));
    const config = configVacia();
    config.ciudadDefault = madrid;
    await pronosticoCiudadDefault(config);
    const vis = visibles();
    expect(vis[1]).toBe("  Madrid, Madrid, España · próximos 7 días");
    expect(vis).toContain(
      "  Fecha       Estado                   Máx     Mín   Lluvia     Viento",
    );
    expect(fetchFalso.urls[0]).toContain("forecast_days=7");
  });

  test("si la API falla muestra el error con el nombre de la ciudad", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => respuestaJson({}, 500));
    const config = configVacia();
    config.ciudadDefault = madrid;
    await pronosticoCiudadDefault(config);
    expect(visibles()).toEqual([
      "  No se pudo obtener el pronóstico de Madrid: la API devolvió HTTP 500.",
    ]);
  });
});

describe("pronosticoTodasCiudades", () => {
  test("sin ciudades avisa y no consulta la API", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => {
      throw new Error("no debería llamarse");
    });
    await pronosticoTodasCiudades(configVacia());
    expect(visibles()).toEqual([
      "  Todavía no hay ciudades guardadas. Usa la opción 3 para agregar una.",
    ]);
    expect(fetchFalso.urls).toEqual([]);
  });

  test("muestra un pronóstico por ciudad y acaba en blanco", async () => {
    consola = espiarConsola();
    fetchFalso = instalarFetch(() => respuestaJson(payloadPronostico));
    const config = configConCiudades([paris]);
    config.ciudadDefault = madrid;
    await pronosticoTodasCiudades(config);
    expect(fetchFalso.urls).toHaveLength(2);
    const vis = visibles();
    expect(vis.filter((l) => l.includes("· próximos 7 días"))).toHaveLength(2);
    expect(vis).toContain("  Madrid, Madrid, España · próximos 7 días");
    expect(vis).toContain("  París, Île-de-France, Francia · próximos 7 días");
    expect(vis[vis.length - 1]).toBe("");
  });

  test("un error en una ciudad no detiene las demás", async () => {
    consola = espiarConsola();
    let llamada = 0;
    fetchFalso = instalarFetch(() => {
      llamada += 1;
      return llamada === 1 ? respuestaJson({}, 500) : respuestaJson(payloadPronostico);
    });
    const config = configConCiudades([otawa]);
    config.ciudadDefault = madrid;
    await pronosticoTodasCiudades(config);
    const vis = visibles();
    expect(vis).toContain(
      "  No se pudo obtener el pronóstico de Madrid: la API devolvió HTTP 500.",
    );
    expect(vis).toContain("  Ottawa, Ontario, Canadá · próximos 7 días");
    expect(fetchFalso.urls).toHaveLength(2);
  });
});
