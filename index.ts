import type { Ciudad, Config } from "./types";
import { buscarCiudades, obtenerClima, obtenerPronostico } from "./api";
import { etiquetaCiudad, pintarClima, pintarPronostico } from "./display";
import { leerOpcion, leerTexto, pintarMenu } from "./menu";
import { cargarConfig, guardarConfig } from "./storage";
import { amarillo, cian, dim, negrita, rojo, verde } from "./color";

let config: Config;

function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function error(mensaje: string): void {
  console.log(rojo(`  ${mensaje}`));
}

function exito(mensaje: string): void {
  console.log(verde(`  ${mensaje}`));
}

function aviso(mensaje: string): void {
  console.log(amarillo(`  ${mensaje}`));
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
    error(`No se pudo obtener el clima de ${ciudad.nombre}: ${mensajeError(e)}.`);
  }
}

async function mostrarPronostico(ciudad: Ciudad): Promise<void> {
  try {
    const pronostico = await obtenerPronostico(ciudad, config.unidad);
    pintarPronostico(ciudad, pronostico);
  } catch (e) {
    error(`No se pudo obtener el pronóstico de ${ciudad.nombre}: ${mensajeError(e)}.`);
  }
}

async function elegirCiudad(): Promise<Ciudad | null> {
  const nombre = await leerTexto("  Nombre de la ciudad (vacío para cancelar): ");
  if (nombre === null || nombre === "") {
    aviso("Búsqueda cancelada.");
    return null;
  }
  let resultados: Ciudad[];
  try {
    resultados = await buscarCiudades(nombre);
  } catch (e) {
    error(`No se pudo consultar la API de geocoding: ${mensajeError(e)}.`);
    return null;
  }
  if (resultados.length === 0) {
    aviso(`No se encontraron resultados para "${nombre}".`);
    return null;
  }
  if (resultados.length === 1) {
    return resultados[0] ?? null;
  }
  console.log("  Elige un resultado:");
  resultados.forEach((r, i) => console.log(`    ${i + 1}. ${etiquetaCiudad(r)}`));
  console.log(dim("    0. Cancelar"));
  const seleccion = await leerTexto("  Opción: ");
  const numero = Number(seleccion);
  if (!Number.isInteger(numero) || numero < 0 || numero > resultados.length) {
    aviso("Selección no válida.");
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
    aviso("Selección no válida.");
    return null;
  }
  return ciudades[numero - 1] ?? null;
}

async function opcion1(): Promise<void> {
  const porDefecto = config.ciudadDefault;
  if (!porDefecto) {
    aviso("No hay ciudad por defecto. Usa la opción 5 para establecer una.");
    return;
  }
  await mostrarClima(porDefecto);
}

async function opcion2(): Promise<void> {
  const todas = config.ciudadDefault ? [config.ciudadDefault, ...config.ciudades] : config.ciudades;
  if (todas.length === 0) {
    aviso("Todavía no hay ciudades guardadas. Usa la opción 3 para agregar una.");
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
    aviso(`"${etiquetaCiudad(candidata)}" ya existe ${detalle}.`);
    return;
  }
  config.ciudades.push(candidata);
  await guardarConfig(config);
  exito(`Ciudad agregada: ${etiquetaCiudad(candidata)}.`);
}

async function opcion4(): Promise<void> {
  if (config.ciudades.length === 0) {
    aviso("No hay ciudades guardadas que eliminar.");
    return;
  }
  const eliminada = await elegirDeLista(config.ciudades, "  ¿Cuál eliminar? ");
  if (!eliminada) return;
  config.ciudades = config.ciudades.filter((c) => c.lat !== eliminada.lat || c.lon !== eliminada.lon);
  await guardarConfig(config);
  exito(`Ciudad eliminada: ${etiquetaCiudad(eliminada)}.`);
}

async function opcion5(): Promise<void> {
  let nueva: Ciudad | null = null;
  if (config.ciudades.length > 0) {
    console.log("  Ciudades guardadas:");
    config.ciudades.forEach((c, i) => console.log(`    ${i + 1}. ${etiquetaCiudad(c)}`));
    console.log(dim("    0. Buscar una ciudad nueva"));
    const seleccion = await leerTexto("  Opción: ");
    const numero = Number(seleccion);
    if (!Number.isInteger(numero) || numero < 0 || numero > config.ciudades.length) {
      aviso("Selección no válida.");
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
  exito(`Ciudad por defecto establecida: ${etiquetaCiudad(nueva)}.`);
}

async function opcion6(): Promise<void> {
  const porDefecto = config.ciudadDefault;
  if (!porDefecto) {
    aviso("No hay ciudad por defecto. Usa la opción 5 para establecer una.");
    return;
  }
  await mostrarPronostico(porDefecto);
}

async function opcion7(): Promise<void> {
  const todas = config.ciudadDefault ? [config.ciudadDefault, ...config.ciudades] : config.ciudades;
  if (todas.length === 0) {
    aviso("Todavía no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const ciudad of todas) {
    await mostrarPronostico(ciudad);
  }
  console.log("");
}

async function opcion8(): Promise<void> {
  config.unidad = config.unidad === "c" ? "f" : "c";
  await guardarConfig(config);
  exito(`Unidad de temperatura cambiada a ${config.unidad === "c" ? "°C" : "°F"}.`);
}

async function main(): Promise<void> {
  config = await cargarConfig();
  console.log(`  ${negrita(cian("Bienvenido a Weather CLI."))} ${dim("Configuración en ~/.weather-cli.json")}`);
  while (true) {
    pintarMenu(config.unidad, totalCiudades());
    const opcion = await leerOpcion();
    if (opcion === null) {
      console.log(`\n  ${negrita(cian("¡Hasta luego!"))}`);
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
      case "6":
        await opcion6();
        break;
      case "7":
        await opcion7();
        break;
      case "8":
        await opcion8();
        break;
      case "9":
        console.log(`  ${negrita(cian("¡Hasta luego!"))}`);
        return;
      default:
        error("Opción no válida, inténtalo de nuevo.");
    }
    console.log("");
  }
}

await main();
