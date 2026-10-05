# AGENTS.md

App de consola (CLI) pequeña en Bun + TypeScript (clima). Punto de entrada único: `index.ts`. Sin monorepo, sin configuración de build más allá de `tsconfig.json`.

## Comandos

- Ejecutar: `bun index.ts` (modo watch: `bun --watch index.ts`)
- Comprobación de tipos: `bunx tsc --noEmit` — no existe ningún script `lint`/`test`/`typecheck` en `package.json`; no inventes uno.
- No hay herramientas de test ni de lint instaladas. Si se añaden tests, deben usar `bun test` (integrado en Bun); no hace falta ningún fichero de configuración.
- Artefacto de release (objetivo del README): compilar un binario autocontenido con `bun build --compile index.ts --outfile=weather`. Verifica que sigue compilando tras cambios significativos.
- Dependencias: `bun install` (`bun.lock` es la fuente de verdad; no lo edites a mano ni uses npm/yarn/pnpm).

## Convenciones

- **Toda la salida de la CLI y los textos visibles al usuario están en español.** El `README.md` está en español y define el texto exacto del menú (caja `WEATHER CLI`, opciones como `Clima de ciudad default`, `Ajustes (°C)`). Respeta ese menú en lugar de escribir textos de interfaz en inglés.
- La persistencia (ciudad por defecto, ciudades guardadas) todavía no está implementada; no existe ningún formato de almacenamiento — elige algo sencillo y mantenlo dentro del repo, sin variables de entorno.
- HTTP: sin API keys, sin `.env`. Flujo de dos pasos según el README: geocoding `https://geocoding-api.open-meteo.com/v1/search?...` → previsión `https://api.open-meteo.com/v1/forecast?...`. Usa el `fetch` nativo de Bun.
- TypeScript es la **native preview (`^7`)**, no 5.x/6.x; `bunx tsc` está disponible localmente (`node_modules/.bin/tsc`).

## Advertencias

- `tsconfig.json` activa `strict` **y** `noUncheckedIndexedAccess`: el acceso por índice a arrays/objetos produce `T | undefined`, así que las búsquedas de opciones del menú y los resultados parseados necesitan narrowing.
- `verbatimModuleSyntax` está activo: usa `import type` para imports solo de tipos.
- Sin CI, sin hooks de pre-commit, sin historial de `AGENTS.md`/`CLAUDE.md`/`opencode.json` — este fichero es la única fuente de instrucciones.
