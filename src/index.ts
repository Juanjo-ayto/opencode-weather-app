import type { Config } from "./types/Config";
import { alternarUnidad } from "./actions/toggleUnit";
import { buscarYAgregarCiudad } from "./actions/addCity";
import { climaCiudadDefault, climaTodasCiudades } from "./actions/getWeather";
import { eliminarCiudadDeLaLista } from "./actions/removeCity";
import { establecerCiudadDefault } from "./actions/setDefaultCity";
import { pronosticoCiudadDefault, pronosticoTodasCiudades } from "./actions/getForecast";
import { leerOpcion } from "./presentation/input";
import { bienvenida, despedida, error } from "./presentation/output";
import { pintarMenu } from "./presentation/menu";
import { totalCiudades } from "./storage/citiesStorage";
import { cargarConfig } from "./storage/settingsStorage";

async function main(): Promise<void> {
  const config: Config = await cargarConfig();
  bienvenida();
  while (true) {
    pintarMenu(config.unidad, totalCiudades(config));
    const opcion = await leerOpcion();
    if (opcion === null) {
      despedida(true);
      return;
    }
    switch (opcion) {
      case "1":
        await climaCiudadDefault(config);
        break;
      case "2":
        await climaTodasCiudades(config);
        break;
      case "3":
        await buscarYAgregarCiudad(config);
        break;
      case "4":
        await eliminarCiudadDeLaLista(config);
        break;
      case "5":
        await establecerCiudadDefault(config);
        break;
      case "6":
        await pronosticoCiudadDefault(config);
        break;
      case "7":
        await pronosticoTodasCiudades(config);
        break;
      case "8":
        await alternarUnidad(config);
        break;
      case "9":
        despedida();
        return;
      default:
        error("Opción no válida, inténtalo de nuevo.");
    }
    console.log("");
  }
}

await main();
