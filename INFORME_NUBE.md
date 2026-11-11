# Informe de despliegue en la nube

**Aplicación:** Tecno Oro  
**Estudiante:** Jean Pierre Chica Ordoñez  
**Asignatura:** Programación Web  
**Fecha:** noviembre de 2026

La tienda de los bloques 1 y 2 queda accesible desde Internet. El navegador abre Angular en Vercel. Angular llama por HTTPS a la API Spring Boot en Railway. La API guarda usuarios, productos y pedidos en PostgreSQL, también en Railway.

## Servicios

| Pieza | Servicio | URL |
|---|---|---|
| Front-end Angular | Vercel | https://tecno-oro-nube.vercel.app |
| API REST Spring Boot | Railway | https://tecno-oro-api-production.up.railway.app |
| Base de datos | PostgreSQL en Railway | no es pública; la usa solo la API |
| Código | GitHub | https://github.com/Jeansitogoat/tecno-oro-nube |

La salud de la API es https://tecno-oro-api-production.up.railway.app/api/salud y responde `{"ok":true,"servicio":"Tecno Oro"}`.

## Pasos de despliegue

1. El código se separó en `frontend` y `backend` y se publicó en GitHub, sin claves.
2. En Railway se creó PostgreSQL y se conectaron `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD` al servicio de la API.
3. La API se construye con el `Dockerfile` de `backend` (Java 17). El perfil `prod` cambia H2 por PostgreSQL y apaga la consola H2. El puerto lo toma de la variable `PORT`.
4. El secreto JWT y el correo de Gmail se cargaron como variables de Railway, no en el repositorio.
5. En `environment.production.ts` se escribió `https://...up.railway.app/api`.
6. Vercel compiló Angular desde la carpeta `frontend` y publicó el sitio estático. `vercel.json` reenvía las rutas de la tienda a `index.html`.

## Configuración principal

- CORS permite `http://localhost:4200` para la Mac y `https://*.vercel.app` para el sitio publicado. `APP_CORS_ORIGENES` puede dejar solo la URL exacta de Vercel. El token viaja en `Authorization`, no en una cookie.
- `app.demo` sigue en false: el código de verificación sale por Gmail y no vuelve en el JSON.
- Cuentas de prueba: `admin@tecnooro.com` / `admin123` y `maria.paredes@correo.com` / `cliente123`.

## Dificultades y soluciones

- Railway no usa el puerto 8080 fijo: Spring lee `PORT`.
- La base de archivo H2 no permanece en el contenedor: en producción se usa PostgreSQL.
- Un `localhost` dentro del JavaScript publicado apuntaría al computador del visitante: el build de producción reemplaza `environment.ts` por `environment.production.ts`.
- El registro devuelve 503. Desde el contenedor de Railway, `smtp.gmail.com` no abre ni en el puerto 587 ni en el 465: los dos intentos terminan en `SocketTimeoutException` a los 8 segundos. La API no muestra el código en pantalla. El ingreso, el catálogo, los pedidos y el CRUD de productos sí funcionan con las cuentas de prueba. El segundo commit no disparó solo el webhook de GitHub; el arreglo se publicó con el CLI de Railway y quedó en estado SUCCESS.

## Evidencias

1. [CAPTURA] Front-end en la URL de Vercel, con la barra de dirección en `https://`.
2. [CAPTURA] API en Railway y el navegador en `/api/salud`.
3. [CAPTURA] PostgreSQL creado en Railway, sin mostrar contraseñas.
4. [CAPTURA] Una operación real desde Vercel: ingreso, catálogo, pedido o cambio en el panel de administración.

## Prueba funcional

Contra la API pública, el 11 de noviembre de 2026:

- [x] Ingreso de `admin@tecnooro.com` y de `maria.paredes@correo.com`
- [x] Consulta del catálogo: 10 productos, el primero Samsung Galaxy S21 Ultra
- [x] Pedido de María Paredes: pedido 1, Samsung Galaxy S21 Ultra, estado EN_PREPARACION
- [x] Con la cuenta de administrador: crear el producto «Prueba nube», cambiar su precio a 2 y eliminarlo
- [ ] Registro con código por Gmail: Railway no deja salir hacia el SMTP de Gmail. El resto de operaciones de la lista sí quedó comprobado.
