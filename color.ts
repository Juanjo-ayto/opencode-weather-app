const entorno = process.env;

function forzarColor(): boolean {
  const force = entorno.FORCE_COLOR;
  return force !== undefined && force !== "" && force !== "0";
}

function sinColor(): boolean {
  return entorno.NO_COLOR !== undefined && entorno.NO_COLOR !== "";
}

export const COLOR_HABILITADO: boolean =
  forzarColor() || (process.stdout.isTTY === true && !sinColor());

type Codigo = string;

function envolver(apertura: Codigo, cierre: Codigo) {
  return (texto: string): string => (COLOR_HABILITADO ? `${apertura}${texto}${cierre}` : texto);
}

export const negrita = envolver("\x1b[1m", "\x1b[22m");
export const dim = envolver("\x1b[2m", "\x1b[22m");
export const rojo = envolver("\x1b[31m", "\x1b[39m");
export const verde = envolver("\x1b[32m", "\x1b[39m");
export const amarillo = envolver("\x1b[33m", "\x1b[39m");
export const azul = envolver("\x1b[94m", "\x1b[39m");
export const magenta = envolver("\x1b[35m", "\x1b[39m");
export const cian = envolver("\x1b[36m", "\x1b[39m");
export const blanco = envolver("\x1b[37m", "\x1b[39m");
export const gris = envolver("\x1b[90m", "\x1b[39m");
export const naranja = envolver("\x1b[38;5;208m", "\x1b[39m");

function aCelsius(valor: number, unidad: string): number {
  return unidad === "f" || unidad === "°F" ? ((valor - 32) * 5) / 9 : valor;
}

export function colorTemperatura(valor: number, unidad: string): (texto: string) => string {
  const celsius = aCelsius(valor, unidad);
  if (celsius < 0) return cian;
  if (celsius < 10) return azul;
  if (celsius < 20) return verde;
  if (celsius < 25) return amarillo;
  if (celsius < 30) return naranja;
  return rojo;
}

export function colorClima(codigo: number): (texto: string) => string {
  if (codigo <= 2) return amarillo;
  if (codigo === 3) return gris;
  if (codigo === 45 || codigo === 48) return gris;
  if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) return azul;
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) return blanco;
  if (codigo >= 95) return magenta;
  return blanco;
}
