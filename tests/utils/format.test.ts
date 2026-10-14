import { describe, expect, test } from "bun:test";
import { descripcionClima, etiquetaCiudad, fechaCorta, num, truncar } from "../../src/utils/format";

describe("descripcionClima", () => {
  test("devuelve la descripción de un código WMO conocido", () => {
    expect(descripcionClima(0)).toBe("Despejado");
    expect(descripcionClima(61)).toBe("Lluvia ligera");
    expect(descripcionClima(95)).toBe("Tormenta");
  });

  test("devuelve desconocido para un código sin traducción", () => {
    expect(descripcionClima(777)).toBe("Clima desconocido (código 777)");
  });
});

describe("etiquetaCiudad", () => {
  test("une nombre, región y país", () => {
    expect(etiquetaCiudad({ nombre: "Madrid", lat: 0, lon: 0, region: "Madrid", pais: "España" })).toBe(
      "Madrid, Madrid, España",
    );
  });

  test("omite región y país ausentes o vacíos", () => {
    expect(etiquetaCiudad({ nombre: "Ottawa", lat: 0, lon: 0 })).toBe("Ottawa");
    expect(
      etiquetaCiudad({ nombre: "Ottawa", lat: 0, lon: 0, region: "", pais: "Canadá" }),
    ).toBe("Ottawa, Canadá");
  });
});

describe("num", () => {
  test("usa formato español con máximo un decimal", () => {
    expect(num(1234.56)).toBe("1234,6");
    expect(num(5)).toBe("5");
    expect(num(-3.14)).toBe("-3,1");
    expect(num(0.49)).toBe("0,5");
  });
});

describe("fechaCorta", () => {
  test("devuelve día de la semana y fecha", () => {
    expect(fechaCorta("2026-01-05")).toBe("lun 5/1");
    expect(fechaCorta("2026-10-14")).toBe("mié 14/10");
  });

  test("devuelve la entrada si la fecha es inválida", () => {
    expect(fechaCorta("no-fecha")).toBe("no-fecha");
    expect(fechaCorta("")).toBe("");
  });
});

describe("truncar", () => {
  test("devuelve el texto si cabe", () => {
    expect(truncar("hola", 10)).toBe("hola");
    expect(truncar("hola", 4)).toBe("hola");
  });

  test("recorta y añade puntos suspensivos si no cabe", () => {
    expect(truncar("abcdefghij", 5)).toBe("abcd…");
    expect(truncar("abcdefghij", 11)).toBe("abcdefghij");
  });
});
