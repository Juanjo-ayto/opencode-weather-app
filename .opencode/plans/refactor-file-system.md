# Plan: Refactorización a estructura `src/` (file-system.md)

## Objetivo

Reorganizar el proyecto para que quede idéntico a `references/file-system.md`, sin cambiar **ningún** comportamiento visible (mismos mensajes en español, mismo menú, mismo formato de `~/.weather-cli.json`).

Decisiones acordadas:
- Entry point: `src/index.ts` (se actualizan scripts de `package.json` y `AGENTS.md`).
- Ficheros en inglés, identificadores/tipos en español, textos de usuario en español.
- Un único `~/.weather-cli.json` (retrocompatible), dividido en `citiesStorage.ts` + `settingsStorage.ts` con helper interno.

## Estructura destino

```
src/
├── actions/
│   ├── getWeather.ts       # Opciones 1 y 2 (clima default / todas)
│   ├── getForecast.ts      # Opciones 6 y 7 (pronóstico)
│   ├── addCity.ts          # Opción 3 (buscar y agregar)
│   ├── removeCity.ts       # Opción 4 (eliminar)
│   ├── setDefaultCity.ts   # Opción 5 (establecer default)
│   ├── toggleUnit.ts       # Opción 8 (°C/°F)
│   ├── listCities.ts       # Impresión del listado numerado (lo usa setDefaultCity)
│   └── selectCity.ts       # elegirCiudad / elegirDeLista (flujo compartido)
├── presentation/
│   ├── menu.ts             # pintarMenu
│   ├── input.ts            # leerOpcion, leerTexto
│   ├── output.ts           # error, exito, aviso, mensajeError, bienvenida/despedida
│   └── weatherDisplay.ts   # pintarClima, pintarPronostico (fichas de clima)
├── storage/
│   ├── configFile.ts       # (interno) leer/parsear/validar/escribir ~/.weather-cli.json
│   ├── citiesStorage.ts    # cargar/guardar ciudades sobre el JSON
│   └── settingsStorage.ts  # cargar/guardar unidad y ciudadDefault, RUTA_CONFIG
├── types/
│   ├── City.ts             # Ciudad
│   ├── Config.ts           # Config
│   ├── Weather.ts          # ClimaActual, DiaPronostico, Pronostico
│   └── MenuOption.ts       # MenuOption (unión "1".."9" | "invalida")
├── api/
│   ├── client.ts           # pedirJson (helper HTTP compartido)
│   ├── geocoding.ts        # buscarCiudades
│   └── weather.ts          # obtenerClima, obtenerPronostico
├── utils/
│   ├── format.ts           # etiquetaCiudad, num, fechaCorta, truncar, descripcionClima
│   ├── constants.ts        # CODIGOS_WMO, ANCHO_MENU, URL_BASE_GEOCODING/FORECAST, CONFIG_VACIA
│   └── colors.ts           # todo color.ts (helpers ANSI, colorTemperatura, colorClima)
└── index.ts                # main(): carga config, bucle, switch → actions
```

## Mapeo fichero a fichero (contenido 1:1, solo cambian imports/rutas)

| Origen | Destino | Contenido |
|---|---|---|
| `types.ts` | `src/types/City.ts` | `Ciudad` |
| | `src/types/Config.ts` | `Config` |
| `api.ts` (exportado) | `src/types/Weather.ts` | `ClimaActual`, `DiaPronostico`, `Pronostico` |
| (nuevo) | `src/types/MenuOption.ts` | `MenuOption` |
| `api.ts` | `src/api/geocoding.ts` | `buscarCiudades` (+ interfaces geocoding internas) |
| | `src/api/weather.ts` | `obtenerClima`, `obtenerPronostico` (+ interfaces respuesta internas) |
| | `src/api/client.ts` | `pedirJson` |
| `storage.ts` | `src/storage/configFile.ts` | `esCiudad`, leer/parsear/escribir el JSON |
| | `src/storage/citiesStorage.ts` | operaciones sobre `ciudades` |
| | `src/storage/settingsStorage.ts` | `RUTA_CONFIG`, unidad, `ciudadDefault` |
| `color.ts` | `src/utils/colors.ts` | sin cambios de contenido |
| `display.ts` | `src/utils/format.ts` | `etiquetaCiudad`, `descripcionClima`, `num`, `fechaCorta`, `truncar` |
| | `src/utils/constants.ts` | `CODIGOS_WMO` |
| | `src/presentation/weatherDisplay.ts` | `pintarClima`, `pintarPronostico`, `fila` |
| `menu.ts` | `src/presentation/menu.ts` | `pintarMenu` |
| | `src/presentation/input.ts` | `leerOpcion`, `leerTexto` |
| `index.ts` | `src/presentation/output.ts` | `mensajeError`, `error`, `exito`, `aviso` |
| | `src/actions/selectCity.ts` | `elegirCiudad`, `elegirDeLista` |
| | `src/actions/getWeather.ts` | `opcion1` → `climaDefault`, `opcion2` → `climaTodas` |
| | `src/actions/getForecast.ts` | `opcion6` → `pronosticoDefault`, `opcion7` → `pronosticoTodos` |
| | `src/actions/addCity.ts` | `opcion3` |
| | `src/actions/removeCity.ts` | `opcion4` |
| | `src/actions/setDefaultCity.ts` | `opcion5` |
| | `src/actions/toggleUnit.ts` | `opcion8` |
| | `src/actions/listCities.ts` | listado numerado + `ciudadExistente` |
| | `src/index.ts` | `main()`, bucle, switch (opción 9 y null → despedida) |

Detalles de diseño:
- **Estado**: se mantiene `let config` en `src/index.ts` y se pasa a las acciones como parámetro (cada acción que persiste llama a `guardarConfig` como antes).
- **`MenuOption`**: `type MenuOption = "1" | ... | "9" | "invalida"`. `leerOpcion` valida: entrada desconocida → `"invalida"` (el `default` del switch imprime el mismo error actual); EOF → `null`.
- **`configFile.ts`** (storage interno): leer JSON crudo (parse + validación con `esCiudad`) y escribir; `settingsStorage` y `citiesStorage` lo usan sobre el mismo `~/.weather-cli.json` con el mismo esquema `{ ciudadDefault, ciudades, unidad }`.
- **URLs de API** como constantes en `utils/constants.ts` (misma query string que hoy).

## Cambios en ficheros raíz

- `package.json`: `"module": "src/index.ts"`, scripts `build`/`start`/`dev` apuntando a `src/index.ts` (el binario de salida sigue en `weather`).
- `AGENTS.md`: actualizar el listado de módulos/imports a la nueva estructura (`src/...`), entry point y nota sobre `weatherDisplay.ts`; el resto de instrucciones (español, strict/noUncheckedIndexedAccess, colores bright, etc.) se mantiene.
- `README.md`: sin cambios (no referencia rutas de código).
- Borrar los ficheros antiguos de la raíz (`index.ts`, `api.ts`, `display.ts`, `menu.ts`, `storage.ts`, `types.ts`, `color.ts`) — usar `git mv` cuando sea posible para preservar historial.

## Reglas a respetar durante la migración

- `verbatimModuleSyntax`: imports solo de tipos con `import type`.
- `noUncheckedIndexedAccess`: conservar los `?? null` / narrowing actuales (p. ej. `resultados[numero - 1] ?? null`).
- Padding/longitudes sobre texto plano antes de envolver con color (como hoy en `display.ts`).
- Sin comentarios nuevos en el código (estilo actual).
- Textos de usuario idénticos carácter a carácter.

## Verificación

1. `bunx tsc --noEmit` → sin errores.
2. `bun run build` (`bun build --compile src/index.ts --outfile weather`) → compila.
3. Smoke test no interactivo: `printf '2\n9\n' | bun src/index.ts` (opción 2 con ciudades vacías → aviso; 9 → despedida) y `printf '' | bun src/index.ts` (EOF → despedida).
4. `git status` para asegurar que no quedan ficheros huérfanos en la raíz.
