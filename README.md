# Bioma — landing con escena 3D

**three.js · un solo archivo HTML · sin servidor · sin conexión**

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

## Regenerar el sitio

```bash
npm install
npm run build     # escribe index.html
npm run preview   # http://localhost:4173
```

`build.mjs` hace tres cosas, en este orden:

1. **Empaqueta** `scene.js` con esbuild. `scene.js` hace
   `import * as THREE from 'three'`, así que three se resuelve desde
   `node_modules` y entra al bundle. Nada de CDN.
2. **Sustituye las fuentes** de `template.html`: cada marcador `__FONT_*__` se
   reemplaza por el `.woff2` correspondiente convertido a `data:` URI.
3. **Inyecta el bundle** en `__BUNDLE__` y escribe `index.html`.

Entre el paso 2 y el 3 valida que no quede ningún marcador sin sustituir, y
aborta si encuentra uno. Es lo que evita publicar una página con un
`__FONT_SANS_400__` literal donde debía ir una tipografía.

> **Esto estaba roto hasta el 19 de septiembre de 2026.** `build.mjs` daba por
> hecho que `bundle.js` ya existía en la carpeta, y ese archivo nunca se
> versionó: al clonar el repositorio el build fallaba, y con él cualquier
> cambio a la plantilla o a la escena. Tampoco había `package.json`, así que
> las dependencias de fuentes no estaban declaradas en ningún lado.
>
> El paso que faltaba ahora es parte del script. `npm run build` reconstruye
> todo desde cero, verificado: el `index.html` regenerado renderiza la escena
> igual que el original.

## Dependencias

| Paquete | Para qué |
|---|---|
| `three` | La escena 3D |
| `esbuild` | Empaqueta `scene.js` con three en un IIFE |
| `@fontsource-variable/fraunces` | Titulares |
| `@fontsource/ibm-plex-sans` | Texto corrido, tres pesos |
| `@fontsource/ibm-plex-mono` | Etiquetas y datos, dos pesos |

Las tres de fuentes son de desarrollo: sus archivos terminan dentro del HTML,
así que el sitio publicado no depende de ellas.
