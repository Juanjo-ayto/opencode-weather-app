import type { Ciudad, Config } from "./types";
import { buscarCiudades, obtenerClima } from "./api";
import { etiquetaCiudad, pintarClima } from "./display";
import { leerOpcion, leerTexto, pintarMenu } from "./menu";
import { cargarConfig, guardarConfig } from "./storage";

let config: Config;

function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function totalCiudades(): number {
  return config.ciudades.length + (config.ciudadDefault ? 1 : 0);
}

function ciudadExistente(candidata: Ciudad): Ciudad | null {
  const todas = config.ciudadDefault ? [config.ciudadDefault, ...config.ciudades] : config.ciudades;
  return todas.find((c) => c.lat === candidata.lat && c.lon === candidata.lon) ?? null;
}

async function mostrarClima(ciudad: Ciudad): Promise<void> {
  try {
    const clima = await obtenerClima(ciudad, config.unidad);
    pintarClima(ciudad, clima);
  } catch (e) {
    console.log(`  No se pudo obtener el clima de ${ciudad.nombre}: ${mensajeError(e)}.`);
  }
}

async function elegirCiudad(): Promise<Ciudad | null> {
  const nombre = await leerTexto("  Nombre de la ciudad (vacío para cancelar): ");
  if (nombre === null || nombre === "") {
    console.log("  Búsqueda cancelada.");
    return null;
  }
  let resultados: Ciudad[];
  try {
    resultados = await buscarCiudades(nombre);
  } catch (e) {
    console.log(`  No se pudo consultar la API de geocoding: ${mensajeError(e)}.`);
    return null;
  }
  if (resultados.length === 0) {
    console.log(`  No se encontraron resultados para "${nombre}".`);
    return null;
  }
  if (resultados.length === 1) {
    return resultados[0] ?? null;
  }
  console.log("  Elige un resultado:");
  resultados.forEach((r, i) => console.log(`    ${i + 1}. ${etiquetaCiudad(r)}`));
  console.log("    0. Cancelar");
  const seleccion = await leerTexto("  Opción: ");
  const numero = Number(seleccion);
  if (!Number.isInteger(numero) || numero < 0 || numero > resultados.length) {
    console.log("  Selección no válida.");
    return null;
  }
  if (numero === 0) return null;
  return resultados[numero - 1] ?? null;
}

async function elegirDeLista(ciudades: Ciudad[], mensaje: string): Promise<Ciudad | null> {
  ciudades.forEach((c, i) => console.log(`    ${i + 1}. ${etiquetaCiudad(c)}`));
  const seleccion = await leerTexto(mensaje);
  const numero = Number(seleccion);
  if (!Number.isInteger(numero) || numero < 1 || numero > ciudades.length) {
    console.log("  Selección no válida.");
    return null;
  }
  return ciudades[numero - 1] ?? null;
}

async function opcion1(): Promise<void> {
  const porDefecto = config.ciudadDefault;
  if (!porDefecto) {
    console.log("  No hay ciudad por defecto. Usa la opción 5 para establecer una.");
    return;
  }
  await mostrarClima(porDefecto);
}

async function opcion2(): Promise<void> {
  const todas = config.ciudadDefault ? [config.ciudadDefault, ...config.ciudades] : config.ciudades;
  if (todas.length === 0) {
    console.log("  Todavía no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const ciudad of todas) {
    await mostrarClima(ciudad);
  }
  console.log("");
}

async function opcion3(): Promise<void> {
  const candidata = await elegirCiudad();
  if (!candidata) return;
  const existente = ciudadExistente(candidata);
  if (existente) {
    const detalle =
      config.ciudadDefault && existente.lat === config.ciudadDefault.lat
        ? "y ya es la ciudad por defecto"
        : "y ya está en la lista";
    console.log(`  "${etiquetaCiudad(candidata)}" ya existe ${detalle}.`);
    return;
  }
  config.ciudades.push(candidata);
  await guardarConfig(config);
  console.log(`  Ciudad agregada: ${etiquetaCiudad(candidata)}.`);
}

async function opcion4(): Promise<void> {
  if (config.ciudades.length === 0) {
    console.log("  No hay ciudades guardadas que eliminar.");
    return;
  }
  const eliminada = await elegirDeLista(config.ciudades, "  ¿Cuál eliminar? ");
  if (!eliminada) return;
  config.ciudades = config.ciudades.filter((c) => c.lat !== eliminada.lat || c.lon !== eliminada.lon);
  await guardarConfig(config);
  console.log(`  Ciudad eliminada: ${etiquetaCiudad(eliminada)}.`);
}

async function opcion5(): Promise<void> {
  let nueva: Ciudad | null = null;
  if (config.ciudades.length > 0) {
    console.log("  Ciudades guardadas:");
    config.ciudades.forEach((c, i) => console.log(`    ${i + 1}. ${etiquetaCiudad(c)}`));
    console.log("    0. Buscar una ciudad nueva");
    const seleccion = await leerTexto("  Opción: ");
    const numero = Number(seleccion);
    if (!Number.isInteger(numero) || numero < 0 || numero > config.ciudades.length) {
      console.log("  Selección no válida.");
      return;
    }
    if (numero === 0) {
      nueva = await elegirCiudad();
    } else {
      const elegida = config.ciudades[numero - 1] ?? null;
      if (elegida) {
        config.ciudades = config.ciudades.filter((c) => c.lat !== elegida.lat || c.lon !== elegida.lon);
      }
      nueva = elegida;
    }
  } else {
    nueva = await elegirCiudad();
  }
  if (!nueva) return;
  config.ciudadDefault = nueva;
  await guardarConfig(config);
  console.log(`  Ciudad por defecto establecida: ${etiquetaCiudad(nueva)}.`);
}

async function opcion8(): Promise<void> {
  config.unidad = config.unidad === "c" ? "f" : "c";
  await guardarConfig(config);
  console.log(`  Unidad de temperatura cambiada a ${config.unidad === "c" ? "°C" : "°F"}.`);
}

async function main(): Promise<void> {
  config = await cargarConfig();
  console.log("  Bienvenido a Weather CLI. Configuración en ~/.weather-cli.json");
  while (true) {
    pintarMenu(config.unidad, totalCiudades());
    const opcion = await leerOpcion();
    if (opcion === null) {
      console.log("\n  ¡Hasta luego!");
      return;
    }
    switch (opcion) {
      case "1":
        await opcion1();
        break;
      case "2":
        await opcion2();
        break;
      case "3":
        await opcion3();
        break;
      case "4":
        await opcion4();
        break;
      case "5":
        await opcion5();
        break;
      case "8":
        await opcion8();
        break;
      case "9":
        console.log("  ¡Hasta luego!");
        return;
      default:
        console.log("  Opción no válida, inténtalo de nuevo.");
    }
    console.log("");
  }
}

await main();
