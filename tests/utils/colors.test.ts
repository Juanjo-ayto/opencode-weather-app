import { describe, expect, test } from "bun:test";
import {
  COLOR_HABILITADO,
  azul,
  cian,
  colorClima,
  colorTemperatura,
  dim,
  gris,
  magenta,
  naranja,
  negrita,
  rojo,
  verde,
  blanco,
  amarillo,
} from "../../src/utils/colors";

describe("COLOR_HABILITADO", () => {
  test("está activo gracias a FORCE_COLOR fijado en tests/setup.ts", () => {
    expect(COLOR_HABILITADO).toBe(true);
  });
});

describe("helpers de color", () => {
  test("envuelven el texto con los códigos ANSI", () => {
    expect(negrita("x")).toBe("\x1b[1mx\x1b[22m");
    expect(dim("x")).toBe("\x1b[2mx\x1b[22m");
    expect(rojo("x")).toBe("\x1b[31mx\x1b[39m");
    expect(verde("x")).toBe("\x1b[32mx\x1b[39m");
    expect(amarillo("x")).toBe("\x1b[33mx\x1b[39m");
    expect(azul("x")).toBe("\x1b[94mx\x1b[39m");
    expect(cian("x")).toBe("\x1b[36mx\x1b[39m");
    expect(gris("x")).toBe("\x1b[90mx\x1b[39m");
    expect(blanco("x")).toBe("\x1b[37mx\x1b[39m");
    expect(magenta("x")).toBe("\x1b[35mx\x1b[39m");
    expect(naranja("x")).toBe("\x1b[38;5;208mx\x1b[39m");
  });
});

describe("colorTemperatura", () => {
  test("elige el color según el umbral en °C", () => {
    expect(colorTemperatura(-1, "c")("t")).toBe("\x1b[36mt\x1b[39m");
    expect(colorTemperatura(0, "c")("t")).toBe("\x1b[94mt\x1b[39m");
    expect(colorTemperatura(9.9, "c")("t")).toBe("\x1b[94mt\x1b[39m");
    expect(colorTemperatura(10, "c")("t")).toBe("\x1b[32mt\x1b[39m");
    expect(colorTemperatura(20, "c")("t")).toBe("\x1b[33mt\x1b[39m");
    expect(colorTemperatura(25, "c")("t")).toBe("\x1b[38;5;208mt\x1b[39m");
    expect(colorTemperatura(30, "c")("t")).toBe("\x1b[31mt\x1b[39m");
  });

  test("convierte Fahrenheit a Celsius antes de decidir", () => {
    expect(colorTemperatura(32, "f")("t")).toBe("\x1b[94mt\x1b[39m");
    expect(colorTemperatura(50, "f")("t")).toBe("\x1b[32mt\x1b[39m");
    expect(colorTemperatura(50, "°F")("t")).toBe("\x1b[32mt\x1b[39m");
    expect(colorTemperatura(100, "f")("t")).toBe("\x1b[31mt\x1b[39m");
  });
});

describe("colorClima", () => {
  test("según rangos WMO", () => {
    expect(colorClima(0)("x")).toBe("\x1b[33mx\x1b[39m");
    expect(colorClima(3)("x")).toBe("\x1b[90mx\x1b[39m");
    expect(colorClima(45)("x")).toBe("\x1b[90mx\x1b[39m");
    expect(colorClima(48)("x")).toBe("\x1b[90mx\x1b[39m");
    expect(colorClima(61)("x")).toBe("\x1b[94mx\x1b[39m");
    expect(colorClima(80)("x")).toBe("\x1b[94mx\x1b[39m");
    expect(colorClima(71)("x")).toBe("\x1b[37mx\x1b[39m");
    expect(colorClima(86)("x")).toBe("\x1b[37mx\x1b[39m");
    expect(colorClima(95)("x")).toBe("\x1b[35mx\x1b[39m");
    expect(colorClima(4)("x")).toBe("\x1b[37mx\x1b[39m");
  });
});
