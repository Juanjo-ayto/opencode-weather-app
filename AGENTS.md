# AGENTS.md

App de consola (CLI) pequeña en Bun + TypeScript (clima). Punto de entrada único: `src/index.ts`. Sin monorepo; configuración de proyecto: `tsconfig.json` y `bunfig.toml` (solo preload de tests).

Estructura (ver `references/file-system.md`): `src/actions/` (acciones del menú: `getWeather`, `getForecast`, `addCity`, `removeCity`, `setDefaultCity`, `toggleUnit`, `listCities`, `selectCity`), `src/presentation/` (`menu.ts`, `input.ts`, `output.ts`, `weatherDisplay.ts`), `src/storage/` (`configFile.ts`, `citiesStorage.ts`, `settingsStorage.ts`), `src/types/` (`City.ts`, `Config.ts`, `Weather.ts`, `MenuOption.ts`), `src/api/` (`client.ts`, `geocoding.ts`, `weather.ts`), `src/utils/` (`format.ts`, `constants.ts`, `colors.ts`). Los nombres de fichero están en inglés pero los identificadores del código siguen en español (`obtenerClima`, `Ciudad`, `pintarMenu`).

## Comandos

- Ejecutar: `bun src/index.ts` (modo watch: `bun --watch src/index.ts`)
- Tests: `bun test` (script `test`; watch: `bun run test:watch`). Están en `tests/` (`*.test.ts`) con `bun test` integrado; no hay frameworks ni herramientas de lint instaladas.
- Build con gate: `bun run build` = `bun test && bun build --compile src/index.ts --outfile weather`. **Si un test falla, no se compila el binario.**
- Comprobación de tipos: `bunx tsc --noEmit` — no existen scripts `lint`/`typecheck` en `package.json`; no inventes uno.
- Artefacto de release (objetivo del README): compilar un binario autocontenido con `bun build --compile src/index.ts --outfile=weather` (siempre pasa antes por los tests vía `bun run build`). Verifica que sigue compilando tras cambios significativos.
- Dependencias: `bun install` (`bun.lock` es la fuente de verdad; no lo edites a mano ni uses npm/yarn/pnpm).

## Tests

- Preload (`bunfig.toml` → `tests/setup.ts`): fija `FORCE_COLOR=1` (colores ANSI siempre activos y testeables), redirige `HOME` a `/tmp/weather-cli-test` (se limpia al inicio de cada ejecución) y mockea `homedir()` de `node:os` con `mock.module` — Bun cachea `$HOME` al arrancar, así que cambiar `process.env.HOME` en runtime no basta. **Nunca se escribe en el `~/.weather-cli.json` real.**
- Helpers en `tests/helpers/`: `mocks.ts` (`instalarFetch`, `instalarPrompt`, `espiarConsola`, `respuestaJson` — restaurar siempre en `afterEach`), `fixtures.ts` (payloads de Open-Meteo y objetos `Ciudad`/`Config`), `ansi.ts` (`sinAnsi` para comparar salidas coloreadas).
- Técnicas: red → mock de `globalThis.fetch`; stdin → mock de `globalThis.prompt`; salida → spy de `console.log`. No se usa `mock.module` fuera del preload y `src/` no se toca para testear.
- Nunca importes `src/index.ts` en tests: ejecuta `await main()` top-level (arrancaría la CLI).
- Las aserciones de texto visible pasan por `sinAnsi(...)` porque `FORCE_COLOR` deja los códigos ANSI en la salida. Aserciones de columnas de `weatherDisplay.ts` y de la caja del menú (`README.md`) deben coincidir **exactamente** en texto plano.

## Convenciones

- **Toda la salida de la CLI y los textos visibles al usuario están en español.** El `README.md` está en español y define el texto exacto del menú (caja `WEATHER CLI`, opciones como `Clima de ciudad default`, `Ajustes (°C)`). Respeta ese menú en lugar de escribir textos de interfaz en inglés.
- La persistencia está implementada en `src/storage/`: JSON en `~/.weather-cli.json` (fuera del repo, vía `homedir()` de `node:os`; en tests el preload lo redirige a un temporal), un único fichero con el esquema `{ ciudadDefault, ciudades, unidad }`. `configFile.ts` hace la lectura/escritura cruda (`leerConfig`/`escribirConfig`, `RUTA_CONFIG`), `settingsStorage.ts` expone `cargarConfig`/`guardarConfig`, y `citiesStorage.ts` gestiona ciudades (`todasCiudades`, `totalCiudades`, `ciudadExistente`, `agregarCiudad`, `eliminarCiudad`, `guardarCiudades`). No uses variables de entorno ni ficheros dentro del repo.
- HTTP: sin API keys, sin `.env`. Flujo de dos pasos según el README: geocoding `https://geocoding-api.open-meteo.com/v1/search?...` → previsión `https://api.open-meteo.com/v1/forecast?...`. Usa el `fetch` nativo de Bun.
- TypeScript es la **native preview (`^7`)**, no 5.x/6.x; `bunx tsc` está disponible localmente (`node_modules/.bin/tsc`).
- Colores: ANSI propios en `src/utils/colors.ts`, sin dependencias (`picocolors`/`chalk`). Los helpers (`negrita`, `dim`, `rojo`, `verde`, `amarillo`, `azul`, `cian`, `magenta`, `gris`, `naranja`) devuelven texto plano si no hay color activo; la activación se calcula una vez en `COLOR_HABILITADO`: TTY + sin `NO_COLOR`, o `FORCE_COLOR` (distinto de `"0"`). Existen helpers semánticos `colorTemperatura(valor, unidad)` (umbrales en °C; convierte si la unidad es `°F`) y `colorClima(codigoWMO)`. Colorea menú (`presentation/menu.ts`), ficha de clima (`presentation/weatherDisplay.ts`) y mensajes de `index.ts` con los helpers locales de `presentation/output.ts`: `error()` (rojo), `exito()` (verde), `aviso()` (amarillo).

## Advertencias

- `tsconfig.json` activa `strict` **y** `noUncheckedIndexedAccess`: el acceso por índice a arrays/objetos produce `T | undefined`, así que las búsquedas de opciones del menú y los resultados parseados necesitan narrowing.
- `verbatimModuleSyntax` está activo: usa `import type` para imports solo de tipos.
- Colores: usa solo códigos legibles sobre fondos oscuros (bright); `azul` es `\x1b[94m`, no `\x1b[34m`. Al envolver texto con color, calcula el padding/longitudes sobre el texto **plano** y aplica el envoltorio ANSI después (ej. `dim(etiqueta.padEnd(14))` en `presentation/weatherDisplay.ts`), o las columnas se descuadran.
- Sin CI, sin hooks de pre-commit, sin historial de `AGENTS.md`/`CLAUDE.md`/`opencode.json` — este fichero es la única fuente de instrucciones.
