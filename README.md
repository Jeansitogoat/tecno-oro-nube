# Tecno Oro en la nube

Misma tienda de los bloques anteriores: Angular, API Spring Boot y base de datos. Esta carpeta se publica en Internet.

| Pieza | Dónde |
|---|---|
| Front-end | Vercel |
| API REST | Railway |
| Base de datos | PostgreSQL de Railway |

En la Mac se puede seguir probando con H2, sin PostgreSQL. `environment.ts` apunta a `http://localhost:8080/api`. El build de producción no usa ese archivo: usa `environment.production.ts`.

## 1. Repositorio

Sube esta carpeta a GitHub. No subas `backend/config/correo.local.properties`, `node_modules`, `dist` ni `backend/data`. El `.gitignore` ya los deja fuera.

## 2. Base de datos en Railway

1. Crea un proyecto en Railway.
2. Agrega PostgreSQL.
3. En el servicio de la API, referencia las variables del Postgres: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD`.

## 3. API en Railway

El servicio usa la carpeta `backend`. Ahí está el `Dockerfile` (Java 17) y `railway.toml`.

Variables del servicio:

| Variable | Valor |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` (el Dockerfile ya lo deja, puedes repetirlo) |
| `APP_JWT_SECRETO` | una frase larga, distinta de la de desarrollo |
| `GMAIL_REMITENTE` | el correo que envía el código |
| `GMAIL_APP_PASSWORD` | la contraseña de aplicación de Gmail |
| `APP_CORS_ORIGENES` | la URL https de Vercel cuando ya exista. Si no, el valor por defecto acepta `https://*.vercel.app` y localhost |

La URL pública queda como `https://TU-SERVICIO.up.railway.app`. La salud es `https://TU-SERVICIO.up.railway.app/api/salud` y debe responder `{"ok":true,"servicio":"Tecno Oro"}`.

## 4. Front-end en Vercel

1. Importa el mismo repositorio.
2. Root Directory: `frontend`.
3. Vercel lee `frontend/vercel.json`: compila con `npm run build` y publica `dist/frontend/browser`.
4. Antes de ese deploy, abre `frontend/src/environments/environment.production.ts` y pon la URL real:

```ts
apiUrl: 'https://TU-SERVICIO.up.railway.app/api'
```

Tiene que ser `https` y terminar en `/api`. No dejes `localhost`.
5. Vuelve a desplegar. Las rutas `/entrar`, `/tienda` y `/admin` las resuelve `vercel.json`.

## 5. Prueba

Cuentas que la API crea al arrancar:

- Administrador: `admin@tecnooro.com` / `admin123`
- Cliente: `maria.paredes@correo.com` / `cliente123`

Desde la URL de Vercel: entrar, ver el catálogo, armar un pedido y, con el administrador, aprobar un cliente o cambiar un producto.

## Desarrollo local

```bash
cd backend
./mvnw spring-boot:run
```

```bash
cd frontend
npm install
npm start
```

La tienda local abre en `http://localhost:4200`. El correo local usa `backend/config/correo.local.properties`, copiado desde `correo.local.example.properties`.
