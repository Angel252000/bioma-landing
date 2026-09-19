import { readFileSync, writeFileSync } from 'node:fs';

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

const bundle = readFileSync('bundle.js', 'utf8').replace(/<\/script/gi, '<\\/script');
html = html.replace('__BUNDLE__', () => bundle);

writeFileSync('index.html', html);
console.log(`index.html ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
