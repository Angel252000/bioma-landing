# Bioma — landing con escena 3D

Una página de aterrizaje con cinco animales construidos por código en three.js:
rana, tucán, perezoso, colibrí y mariposa morfo. Ninguno es un modelo
descargado — cada uno se arma con esferas y cilindros deformados en
`scene.js`.

## Cómo verlo

**Se abre y ya.** No hace falta servidor, ni instalar nada, ni conexión.

```bash
open index.html          # macOS
xdg-open index.html      # Linux
```

`index.html` pesa 0.86 MB y es **completamente autocontenido**: cero peticiones
externas. Las seis fuentes van embebidas como `data:font/woff2` y el bundle de
three.js está incrustado en la propia página. Se puede abrir desde un USB, sin
red, y se ve igual.

Para publicarlo, ese único archivo es todo lo que hay que subir.

## Los archivos

| Archivo | Qué es |
|---|---|
| `index.html` | **El sitio.** Generado. Es lo que se publica |
| `template.html` | La plantilla, con marcadores `__FONT_*__` y `__BUNDLE__` |
| `scene.js` | Las cinco criaturas y la escena de three.js |
| `build.mjs` | Sustituye los marcadores y escribe `index.html` |

## Cómo está hecha la escena

`scene.js` tiene una función constructora por animal —`buildFrog`,
`buildToucan`, `buildSloth`, `buildHummingbird`, `buildMorpho`— más dos
ayudantes, `limb()` y `ball()`, que son las piezas de las que sale todo.

La iluminación es de tres puntos: una direccional cálida como luz principal,
una fría de contra, y una hemisférica de relleno. Las sombras caen sobre un
`ShadowMaterial` casi transparente, para que se vea la sombra y no el plano.

**Respeta `prefers-reduced-motion`.** Quien pidió menos movimiento en su sistema
ve la escena quieta.

## ⚠️ Regenerar `index.html` no funciona hoy

`build.mjs` necesita dos cosas que **no están en este repositorio**:

1. **`bundle.js`** — el empaquetado de three.js. No está el archivo ni el paso
   que lo genera.
2. **Los paquetes de fuentes** — `@fontsource-variable/fraunces`,
   `@fontsource/ibm-plex-sans` y `@fontsource/ibm-plex-mono`. No hay
   `package.json` que los declare.

Esto **no impide usar el sitio**: `index.html` ya está generado y funciona solo.
Lo que no se puede hoy es rehacerlo tras editar `template.html` o `scene.js`.

Para recuperar esa capacidad hace falta: crear el `package.json` con las tres
dependencias de fuentes, y reconstruir el paso que produce `bundle.js` a partir
de `scene.js` más three.js.

> Se deja escrito en vez de arreglarlo a medias, porque un `build.mjs` que
> parece funcionar y falla al tercer intento es peor que uno con su limitación
> declarada.
