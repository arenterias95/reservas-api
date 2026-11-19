# reservas-api

**Dominio:** reservas de espacios físicos (salones, laboratorios, canchas, auditorios) de una institución. La API gestiona los espacios y las personas que los solicitan; la reserva en sí (con control de cruces de horario) es la siguiente etapa.

Proyecto de Programación V (Backend), con Express 5 y TypeScript, organizado en capas: **Router → Controller → Service → datos en memoria**, con autenticación por token y autorización por rol y por dueño del recurso.

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
| GET    | `/spaces/:id`      | Obtener un espacio                      | 200   | 404                |
| POST   | `/spaces`          | Crear espacio                           | 201   | 400, 401, 403      |
| PUT    | `/spaces/:id`      | Actualizar espacio                      | 200   | 400, 401, 403, 404 |
| DELETE | `/spaces/:id`      | Borrar espacio                          | 204   | 401, 403, 404      |
| GET    | `/requesters`      | Listar solicitantes                     | 200   |                    |
| GET    | `/requesters/:id`  | Obtener un solicitante                  | 200   | 404                |
| POST   | `/requesters`      | Crear solicitante                       | 201   | 400, 401, 403      |
| PUT    | `/requesters/:id`  | Actualizar solicitante                  | 200   | 401, 403, 404      |
| DELETE | `/requesters/:id`  | Borrar solicitante                      | 204   | 401, 403, 404      |

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

## Correrlo con Docker

```bash
docker compose up --build
```

La API queda en http://localhost:3000 (prueba: `/health`). Para usar su propio secreto JWT:

```bash
JWT_SECRET="un-secreto-largo" docker compose up --build
```

Para detenerlo: `docker compose down`. Los datos viven en memoria, así que se reinician con cada arranque.

## Pruebas con Postman

Importar `docs/postman/reservas-api.postman_collection.json` y ejecutarla completa, en orden, con el servidor recién reiniciado (los datos en memoria cambian a medida que corren las peticiones). Usa la variable `baseUrl` (`http://localhost:3000`); los logins guardan automáticamente `tokenAdmin`, `tokenLaura`, `tokenWilliams` y `tokenAna`, y cada petición valida el código de estado esperado.

## Modelo de datos

Las tres entidades del dominio (espacio, solicitante y reserva) están descritas en [docs/modelo-datos.md](docs/modelo-datos.md).

## Créditos

La estructura parte del proyecto del grupo 3 de Programación V (UNIAJC), desarrollado por Erick Santiago Carmona, Daniel Imbachi y Jaider Angulo, y de la guía AcademiaAPI del curso. Esta copia se publica sin el historial original de commits.
