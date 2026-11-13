import { writeFileSync } from 'node:fs';

const apiUrl = (process.env.API_URL || '').trim().replace(/\/$/, '');

if (!apiUrl) {
  console.log('API_URL no está definida. Se usa environment.production.ts del repositorio.');
  process.exit(0);
}

if (!/^https?:\/\/[^\s'"]+$/.test(apiUrl)) {
  console.error('API_URL tiene que ser una URL http o https.');
  process.exit(1);
}

const archivo = new URL('../src/environments/environment.production.ts', import.meta.url);
const contenido = `// La escribe el build cuando Vercel define API_URL.
export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
};
`;

writeFileSync(archivo, contenido);
console.log('API de producción: ' + apiUrl);
