import { describe, expect, test } from "bun:test";
import {
  ANCHO_MENU,
  CODIGOS_WMO,
  CONFIG_VACIA,
  URL_FORECAST,
  URL_GEOCODING,
} from "../../src/utils/constants";

describe("constantes", () => {
  test("las URLs coinciden con las del README (Open-Meteo, sin API key)", () => {
    expect(URL_GEOCODING).toBe("https://geocoding-api.open-meteo.com/v1/search");
    expect(URL_FORECAST).toBe("https://api.open-meteo.com/v1/forecast");
  });

  test("ANCHO_MENU es 40", () => {
    expect(ANCHO_MENU).toBe(40);
  });

  test("CONFIG_VACIA tiene la forma por defecto", () => {
    expect(CONFIG_VACIA).toEqual({ ciudadDefault: null, ciudades: [], unidad: "c" });
  });

  test("CODIGOS_WMO cubre los códigos usados por la app", () => {
    for (const codigo of [0, 1, 2, 3, 45, 48, 61, 71, 80, 95, 99]) {
      expect(typeof CODIGOS_WMO[codigo]).toBe("string");
    }
    expect(CODIGOS_WMO[0]).toBe("Despejado");
  });
});
