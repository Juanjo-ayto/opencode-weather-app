export type Unidad = "c" | "f";

export interface ClimaActual {
  hora: string;
  temperatura: number;
  sensacion: number;
  humedad: number;
  viento: number;
  codigoClima: number;
  unidadTemperatura: string;
}

export interface DiaPronostico {
  fecha: string;
  codigoClima: number;
  tempMax: number;
  tempMin: number;
  probLluvia: number;
  vientoMax: number;
}

export interface Pronostico {
  dias: DiaPronostico[];
  unidadTemperatura: string;
}
