import type { Config } from "../types/Config";
import { aviso, exito } from "../presentation/output";
import { agregarCiudad, ciudadExistente, guardarCiudades } from "../storage/citiesStorage";
import { etiquetaCiudad } from "../utils/format";
import { elegirCiudad } from "./selectCity";

export async function buscarYAgregarCiudad(config: Config): Promise<void> {
  const candidata = await elegirCiudad();
  if (!candidata) return;
  const existente = ciudadExistente(config, candidata);
  if (existente) {
    const detalle =
      config.ciudadDefault && existente.lat === config.ciudadDefault.lat
        ? "y ya es la ciudad por defecto"
        : "y ya está en la lista";
    aviso(`"${etiquetaCiudad(candidata)}" ya existe ${detalle}.`);
    return;
  }
  agregarCiudad(config, candidata);
  await guardarCiudades(config);
  exito(`Ciudad agregada: ${etiquetaCiudad(candidata)}.`);
}
