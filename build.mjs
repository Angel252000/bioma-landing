import { readFileSync, writeFileSync } from 'node:fs';
import { build as esbuild } from 'esbuild';

/*
  El bundle se genera aca, no aparte.

  Antes `build.mjs` daba por hecho que `bundle.js` ya existia en la carpeta, y
  ese archivo nunca se versiono: el build quedaba roto para cualquiera que
  clonara el repositorio, incluido el autor en otra maquina. Ahora el paso que
  falta es parte del script, y `npm run build` reconstruye todo desde cero.

  `scene.js` hace `import * as THREE from 'three'`, asi que esbuild resuelve
  three desde node_modules y lo empaqueta en un IIFE. Nada de CDN: el archivo
  resultante se incrusta en el HTML y la pagina abre sin red.
*/
const { outputFiles } = await esbuild({
  entryPoints: ['scene.js'],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  write: false,
});
const bundleJs = outputFiles[0].text;

const dataUri = (path) =>
  `data:font/woff2;base64,${readFileSync(path).toString('base64')}`;

const fonts = {
  __FONT_FRAUNCES__: 'node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2',
  __FONT_SANS_400__: 'node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2',
  __FONT_SANS_500__: 'node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2',
  __FONT_SANS_600__: 'node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2',
  __FONT_MONO_400__: 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
  __FONT_MONO_500__: 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2',
};

let html = readFileSync('template.html', 'utf8');

for (const [token, path] of Object.entries(fonts)) {
  const uri = dataUri(path);
  html = html.replace(token, () => uri);
}

// Se valida antes de inyectar el bundle: three declara sus propios
// globales __THREE__ / __THREE_DEVTOOLS__ y dispararían un falso positivo.
const leftovers = html.match(/__(?!BUNDLE__)[A-Z_]+__/g);
if (leftovers) throw new Error(`Marcadores sin sustituir: ${leftovers.join(', ')}`);

// Escapar `</script` para que el propio bundle no cierre la etiqueta que lo
// contiene. Es la unica forma de que un <script> en linea sea seguro.
const bundle = bundleJs.replace(/<\/script/gi, '<\\/script');
html = html.replace('__BUNDLE__', () => bundle);

writeFileSync('index.html', html);
console.log(`index.html ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
