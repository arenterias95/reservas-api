# reservas-api

**Dominio:** reservas de espacios físicos (salones, laboratorios, canchas, auditorios) de una institución. La API gestiona los espacios y las personas que los solicitan; la reserva en sí (con control de cruces de horario) es la siguiente etapa.

Proyecto de Programación V (Backend), con Express 5 y TypeScript, organizado en capas: **Router → Controller → Service → datos en memoria**, con autenticación por token, autorización por rol y por dueño del recurso, validación de entrada con Zod y manejo de errores centralizado.

## Requisitos

- Node.js 20.12 o superior

## Cómo correrlo

```bash
npm install
cp .env.example .env     # y cambiar JWT_SECRET por un valor propio
npm run dev
```

Abrir http://localhost:3000/health: debe responder `{"status":"ok"}`.

Los datos viven en memoria: al reiniciar el servidor vuelven a los datos semilla (y las cuentas registradas desaparecen). El archivo `.env` no se sube al repositorio.

## Autenticación

- `POST /auth/register` crea una cuenta. **Siempre** queda con rol `USER`: el rol nunca se toma del body.
- `POST /auth/login` devuelve `{ "token": "..." }` (válido 2 horas).
- Las rutas protegidas piden el header `Authorization: Bearer <token>` (la palabra `Bearer`, un espacio y el token).
- Las contraseñas se guardan con hash (scrypt) y el token se firma con HS256 usando `JWT_SECRET`.

Cuentas semilla (contraseña de todas: `Clave123*`):

| Correo                   | Rol         | Dueño de los espacios |
|--------------------------|-------------|-----------------------|
| admin@reservas.edu       | ADMIN       | administra todo       |
| laura@reservas.edu       | COORDINATOR | 2                     |
| williams@reservas.edu    | COORDINATOR | 1 y 3                 |

El espacio 4 no tiene dueño: solo el ADMIN puede modificarlo.

## Los cuatro filtros de las rutas de escritura

1. `requireAuth`: ¿quién eres? Sin token válido responde **401**.
2. `requireRole`: ¿qué puedes hacer? Con un rol que no corresponde responde **403**.
3. En el Service, si el espacio no existe responde **404**.
4. En el Service, si el espacio es de otro responde **403** (solo el dueño o un ADMIN).

El orden importa: `requireRole` lee `req.user`, que solo existe después de `requireAuth`.

## Endpoints

| Verbo  | Ruta               | Descripción                             | Éxito | Errores            |
|--------|--------------------|-----------------------------------------|-------|--------------------|
| GET    | `/health`          | Estado del servidor                     | 200   |                    |
| POST   | `/auth/register`   | Crear cuenta (rol USER)                 | 201   | 400, 409           |
| POST   | `/auth/login`      | Obtener token                           | 200   | 400, 401           |
| GET    | `/auth/me`         | Datos de la cuenta autenticada          | 200   | 401                |
| GET    | `/spaces`          | Listar espacios                         | 200   |                    |
| GET    | `/spaces/mios`     | Espacios del usuario autenticado        | 200   | 401                |
| GET    | `/spaces/:id`      | Obtener un espacio                      | 200   | 400, 404           |
| POST   | `/spaces`          | Crear espacio                           | 201   | 400, 401, 403      |
| PUT    | `/spaces/:id`      | Actualizar espacio                      | 200   | 400, 401, 403, 404 |
| DELETE | `/spaces/:id`      | Borrar espacio                          | 204   | 400, 401, 403, 404 |
| GET    | `/requesters`      | Listar solicitantes                     | 200   |                    |
| GET    | `/requesters/:id`  | Obtener un solicitante                  | 200   | 400, 404           |
| POST   | `/requesters`      | Crear solicitante                       | 201   | 400, 401, 403, 409 |
| PUT    | `/requesters/:id`  | Actualizar solicitante                  | 200   | 400, 401, 403, 404, 409 |
| DELETE | `/requesters/:id`  | Borrar solicitante                      | 204   | 400, 401, 403, 404 |

Cuerpos de ejemplo:

```json
// POST /auth/login
{ "email": "williams@reservas.edu", "password": "Clave123*" }

// POST /spaces  (name y capacity son obligatorios; el dueño es quien crea)
{ "name": "Sala de Juntas", "capacity": 12, "location": "Bloque D", "type": "sala" }

// POST /requesters  (solo ADMIN; name y email son obligatorios)
{ "name": "Ana Martinez", "email": "ana@universidad.edu" }
```

## Matriz de permisos

| Endpoint                          | Público    | USER       | COORDINATOR       | ADMIN      |
|-----------------------------------|------------|------------|-------------------|------------|
| `GET /health`                     | Permitido  | Permitido  | Permitido         | Permitido  |
| `POST /auth/register`, `/login`   | Permitido  | Permitido  | Permitido         | Permitido  |
| `GET /auth/me`                    | Denegado   | Permitido  | Permitido         | Permitido  |
| `GET /spaces`, `/spaces/:id`      | Permitido  | Permitido  | Permitido         | Permitido  |
| `GET /spaces/mios`                | Denegado   | Permitido  | Permitido         | Permitido  |
| `POST /spaces`                    | Denegado   | Denegado   | Permitido         | Permitido  |
| `PUT /spaces/:id`                 | Denegado   | Denegado   | Solo dueño        | Permitido  |
| `DELETE /spaces/:id`              | Denegado   | Denegado   | Solo dueño        | Permitido  |
| `GET /requesters`, `/:id`         | Permitido  | Permitido  | Permitido         | Permitido  |
| `POST/PUT/DELETE /requesters`     | Denegado   | Denegado   | Denegado          | Permitido  |

## Manejo de errores y validación

Todos los errores responden con el mismo formato JSON y el código HTTP que corresponde:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Datos de entrada invalidos", "details": [ { "campo": "capacity", "mensaje": "capacity debe ser mayor que 0" } ] } }
```

- `details` solo aparece en los errores de validación.
- Los Services y los middlewares lanzan `AppError` (`src/errors/app-error.ts`); los controladores no tienen `try/catch` ni `if` de validación.
- `notFoundMiddleware` y `errorMiddleware` (`src/middlewares/error.middleware.ts`) se montan al final de `src/index.ts`, después de todas las rutas.
- Cada endpoint de escritura valida el body con un esquema Zod (`src/schemas/`), y las rutas con `:id` validan el id. El orden de cada ruta es `requireAuth → requireRole → validate → controlador`.
- Zod descarta los campos que no están en el esquema: un `"role": "ADMIN"` en el registro no llega al controlador.
- Un error inesperado responde 500 `INTERNAL_ERROR`. Con `NODE_ENV=production` la respuesta no incluye `stack`; el detalle completo queda en la consola del servidor (`console.error`).

### Catálogo de errores

| HTTP | code                  | Cuándo ocurre |
|------|-----------------------|---------------|
| 400  | `VALIDATION_ERROR`    | El body o el id de la ruta no cumplen el esquema Zod (campo faltante, email inválido, número no positivo, id no numérico, PUT sin campos). `details` lista cada campo con su mensaje. |
| 400  | `INVALID_JSON`        | El cuerpo de la petición no es un JSON válido. |
| 401  | `TOKEN_MISSING`       | La ruta exige token y no llegó el header `Authorization: Bearer <token>`. |
| 401  | `TOKEN_INVALID`       | El token está alterado, mal formado o expirado. |
| 401  | `INVALID_CREDENTIALS` | Login con un correo que no existe o una contraseña incorrecta (el mismo error en los dos casos). |
| 403  | `FORBIDDEN_ROLE`      | El rol del usuario no tiene permiso para la acción (por ejemplo, un USER crea un espacio). |
| 403  | `NOT_SPACE_OWNER`     | Un COORDINATOR intenta editar o borrar un espacio que no es suyo. |
| 404  | `SPACE_NOT_FOUND`     | El espacio con ese id no existe. |
| 404  | `REQUESTER_NOT_FOUND` | El solicitante con ese id no existe. |
| 404  | `USER_NOT_FOUND`      | La cuenta del token ya no existe (`GET /auth/me`). |
| 404  | `ROUTE_NOT_FOUND`     | La ruta o el verbo no existen (por ejemplo, `GET /cursos`). |
| 409  | `EMAIL_TAKEN`         | Registro con un correo que ya tiene cuenta. |
| 409  | `DUPLICATE`           | Crear o editar un solicitante con un correo que ya usa otro solicitante. |
| 413  | `PAYLOAD_TOO_LARGE`   | El cuerpo de la petición supera el límite de `express.json` (100 KB). |
| 500  | `INTERNAL_ERROR`      | Error inesperado del servidor (por ejemplo, falta `JWT_SECRET`). En producción no incluye `stack`. |

La API guarda los datos en memoria y no usa base de datos, por eso no devuelve los errores de Prisma (`P2002`, `P2025`, `P2003`) ni el 503 `DATABASE_UNAVAILABLE` del taller; el valor único repetido se controla en el Service y responde 409.

### Cómo provocar el 500 en producción

Sin archivo `.env` (o sin `JWT_SECRET`) y con `NODE_ENV=production`:

```bash
mv .env .env.bak                     # si existe
NODE_ENV=production npm run dev
```

Un `POST /auth/login` válido responde `500 {"error":{"code":"INTERNAL_ERROR","message":"Error interno del servidor"}}`, sin `stack`, y la consola del servidor muestra `Error: JWT_SECRET_MISSING`. Después: `mv .env.bak .env`.

## Correrlo con Docker

```bash
docker compose up --build
```

La API queda en http://localhost:3000 (prueba: `/health`). Para usar su propio secreto JWT:

```bash
JWT_SECRET="un-secreto-largo" docker compose up --build
```

Para detenerlo: `docker compose down`. Los datos viven en memoria, así que se reinician con cada arranque.

## Pruebas desde la terminal (bash)

Con el servidor corriendo (`npm run dev` o Docker), en otra terminal:

```bash
bash scripts/probar-api.sh
```

Prueba autenticación, el Taller 7 y el taller de errores con `curl` (400 de Zod y de JSON, 401, 403 por rol, 403 no es dueño, 404, 409 y 200), revisa el formato `{ "error": { "code", "message" } }` e imprime PASA/FALLA por caso. Reinicie el servidor antes de cada corrida: los datos viven en memoria.

## Pruebas con Postman

Importar `docs/postman/reservas-api.postman_collection.json` y ejecutarla completa, en orden, con el servidor recién reiniciado (los datos en memoria cambian a medida que corren las peticiones). Usa la variable `baseUrl` (`http://localhost:3000`); los logins guardan automáticamente `tokenAdmin`, `tokenLaura`, `tokenWilliams` y `tokenAna`, y cada petición valida el código de estado esperado (y, en los errores, el `code` del formato único). La carpeta **Errores** reúne los casos del taller de errores; la petición 7 (500) solo aplica con el servidor arrancado sin `JWT_SECRET` y con `NODE_ENV=production`, y en una corrida normal queda omitida. Las capturas de evidencia van en `evidencias/manejo-errores/`.

## Modelo de datos

Las tres entidades del dominio (espacio, solicitante y reserva) están descritas en [docs/modelo-datos.md](docs/modelo-datos.md).

## Créditos

La estructura parte del proyecto del grupo 3 de Programación V (UNIAJC), desarrollado por Erick Santiago Carmona, Daniel Imbachi y Jaider Angulo, y de la guía AcademiaAPI del curso. Esta copia se publica sin el historial original de commits.
