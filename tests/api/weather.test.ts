import { afterEach, describe, expect, test } from "bun:test";
import { obtenerClima, obtenerPronostico } from "../../src/api/weather";
import { URL_FORECAST } from "../../src/utils/constants";
import { instalarFetch, respuestaJson, type FetchFalso } from "../helpers/mocks";
import { madrid, payloadClima, payloadPronostico } from "../helpers/fixtures";

let fetchFalso: FetchFalso | undefined;

afterEach(() => {
  fetchFalso?.restaurar();
  fetchFalso = undefined;
});

function parametros(url: string): URLSearchParams {
  const [consulta] = url.split("?");
  expect(consulta).toBe(URL_FORECAST);
  return new URLSearchParams(url.slice((consulta ?? "").length + 1));
}

describe("obtenerClima", () => {
  test("consulta la API con los parámetros del README (sin unidad extra en °C)", async () => {
    fetchFalso = instalarFetch(() => respuestaJson(payloadClima));
    await obtenerClima(madrid, "c");
    const p = parametros(fetchFalso.urls[0] ?? "");
    expect(p.get("latitude")).toBe("40.4168");
    expect(p.get("longitude")).toBe("-3.7038");
    expect(p.get("current")).toBe(
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    );
    expect(p.get("timezone")).toBe("auto");
    expect(p.get("temperature_unit")).toBeNull();
  });

  test("pide Fahrenheit cuando la unidad es f", async () => {
    fetchFalso = instalarFetch(() => respuestaJson(payloadClima));
    await obtenerClima(madrid, "f");
    expect(parametros(fetchFalso.urls[0] ?? "").get("temperature_unit")).toBe("fahrenheit");
  });

  test("parsea la respuesta completa", async () => {
    fetchFalso = instalarFetch(() => respuestaJson(payloadClima));
    expect(await obtenerClima(madrid, "c")).toEqual({
      hora: "2026-10-14 12:00",
      temperatura: 21.5,
      sensacion: 20.9,
      humedad: 55,
      viento: 12.3,
      codigoClima: 1,
      unidadTemperatura: "°C",
    });
  });

  test("aplica fallbacks para campos ausentes", async () => {
    fetchFalso = instalarFetch(() =>
      respuestaJson({ current: { temperature_2m: 30, weather_code: 0 } }),
    );
    expect(await obtenerClima(madrid, "c")).toEqual({
      hora: "",
      temperatura: 30,
      sensacion: 30,
      humedad: 0,
      viento: 0,
      codigoClima: 0,
      unidadTemperatura: "°C",
    });
    fetchFalso = instalarFetch(() =>
      respuestaJson({ current: { temperature_2m: 80, weather_code: 0 } }),
    );
    expect((await obtenerClima(madrid, "f")).unidadTemperatura).toBe("°F");
  });

  test("lanza si falta current, temperature_2m o weather_code", async () => {
    fetchFalso = instalarFetch(() => respuestaJson({}));
    await expect(obtenerClima(madrid, "c")).rejects.toThrow(
      "respuesta inesperada de la API de previsión",
    );
    fetchFalso = instalarFetch(() => respuestaJson({ current: { weather_code: 1 } }));
    await expect(obtenerClima(madrid, "c")).rejects.toThrow(
      "respuesta inesperada de la API de previsión",
    );
    fetchFalso = instalarFetch(() => respuestaJson({ current: { temperature_2m: 5 } }));
    await expect(obtenerClima(madrid, "c")).rejects.toThrow(
      "respuesta inesperada de la API de previsión",
    );
  });
});

describe("obtenerPronostico", () => {
  test("consulta 7 días con los parámetros del README", async () => {
    fetchFalso = instalarFetch(() => respuestaJson(payloadPronostico));
    await obtenerPronostico(madrid, "c");
    const p = parametros(fetchFalso.urls[0] ?? "");
    expect(p.get("latitude")).toBe("40.4168");
    expect(p.get("longitude")).toBe("-3.7038");
    expect(p.get("daily")).toBe(
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
    );
    expect(p.get("forecast_days")).toBe("7");
    expect(p.get("timezone")).toBe("auto");
    expect(p.get("temperature_unit")).toBeNull();
  });

  test("pide Fahrenheit cuando la unidad es f", async () => {
    fetchFalso = instalarFetch(() => respuestaJson(payloadPronostico));
    await obtenerPronostico(madrid, "f");
    expect(parametros(fetchFalso.urls[0] ?? "").get("temperature_unit")).toBe("fahrenheit");
  });

  test("parsea los 7 días", async () => {
    fetchFalso = instalarFetch(() => respuestaJson(payloadPronostico));
    const pronostico = await obtenerPronostico(madrid, "c");
    expect(pronostico.unidadTemperatura).toBe("°C");
    expect(pronostico.dias).toHaveLength(7);
    expect(pronostico.dias[0]).toEqual({
      fecha: "2026-10-14",
      codigoClima: 0,
      tempMax: 25,
      tempMin: 12,
      probLluvia: 0,
      vientoMax: 10,
    });
    expect(pronostico.dias[6]?.fecha).toBe("2026-10-20");
  });

  test("rellena con ceros los campos opcionales ausentes o null", async () => {
    fetchFalso = instalarFetch(() =>
      respuestaJson({
        daily: {
          time: ["2026-10-14", "2026-10-15"],
          temperature_2m_max: [20, 21],
          temperature_2m_min: [10, 11],
          precipitation_probability_max: [null, 50],
        },
      }),
    );
    const pronostico = await obtenerPronostico(madrid, "c");
    expect(pronostico.dias[0]).toEqual({
      fecha: "2026-10-14",
      codigoClima: 0,
      tempMax: 20,
      tempMin: 10,
      probLluvia: 0,
      vientoMax: 0,
    });
    expect(pronostico.dias[1]?.codigoClima).toBe(0);
    expect(pronostico.dias[1]?.probLluvia).toBe(50);
    expect(pronostico.unidadTemperatura).toBe("°C");
  });

  test("lanza si faltan time o temperature_2m_max", async () => {
    fetchFalso = instalarFetch(() => respuestaJson({ daily: { temperature_2m_max: [1] } }));
    await expect(obtenerPronostico(madrid, "c")).rejects.toThrow(
      "respuesta inesperada de la API de previsión",
    );
    fetchFalso = instalarFetch(() => respuestaJson({ daily: { time: ["2026-10-14"] } }));
    await expect(obtenerPronostico(madrid, "c")).rejects.toThrow(
      "respuesta inesperada de la API de previsión",
    );
    fetchFalso = instalarFetch(() => respuestaJson({}));
    await expect(obtenerPronostico(madrid, "c")).rejects.toThrow(
      "respuesta inesperada de la API de previsión",
    );
  });
});
