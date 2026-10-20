# Bioma — landing con escena 3D

Landing de una página con cinco animales (rana, tucán, perezoso, colibrí,
mariposa morfo) construidos por código en three.js — ningún modelo
descargado, todo esferas y cilindros deformados.

## Stack

Node solo para build-time (`esbuild` + `three`). El sitio publicado es un
único `index.html` autocontenido: cero dependencias en runtime, cero
peticiones externas, abre desde un USB sin red.

## File map

| File | Role |
|---|---|
| `scene.js` | Las cinco criaturas y la escena three.js — una función constructora por animal (`buildFrog`, `buildToucan`, `buildSloth`, `buildHummingbird`, `buildMorpho`) más `limb()`/`ball()` como piezas base. |
| `template.html` | Plantilla con marcadores `__FONT_*__` y `__BUNDLE__`. |
| `build.mjs` | Empaqueta `scene.js` con esbuild (IIFE, three incluido), convierte las 6 fuentes a `data:font/woff2`, inyecta todo en `template.html` → `index.html`. Valida que no queden marcadores sin sustituir antes de escribir. |
| `index.html` | **Generado — no editar a mano.** Es lo único que se publica. |

## Commands

```bash
npm install
npm run build     # regenera index.html desde scene.js + template.html
npm run preview   # http://localhost:4173
open index.html   # ver el sitio ya generado, sin servidor
```

## Gotchas

- **`index.html` es un artefacto de build.** Cualquier cambio de contenido o
  estilo va en `template.html`/`scene.js`, nunca directo en `index.html` —
  se pisa en el próximo `npm run build`.
- Hasta el 19 sep 2026 el build estaba roto: `bundle.js` no existía y no
  estaba versionado. Ya está resuelto — `build.mjs` genera el bundle desde
  cero cada vez, no asume que ya existe.
- Sin `git` todavía. Si se inicializa, el `.gitignore` tiene que cubrir
  `node_modules/` — las fuentes y three.js viven ahí y no deben subirse.

## Deeper context

`README.md` en este mismo repo ya documenta esto a fondo (arquitectura de la
escena, orden exacto del build, por qué cada dependencia). Este archivo es
solo el resumen para un agente — para el detalle humano, leer el README.
