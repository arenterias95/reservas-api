# reservas-api

**Dominio:** reservas de espacios físicos (salones, laboratorios, canchas, auditorios) de una institución. La API gestiona los espacios y las personas que los solicitan; la reserva en sí (con control de cruces de horario) es la siguiente etapa.

Proyecto de Programación V (Backend), con Express 5 y TypeScript, organizado en capas: **Router → Controller → Service → datos en memoria**.

## Requisitos

- Node.js 20 o superior

## Cómo correrlo

```bash
npm install
cp .env.example .env
npm run dev
```

Abrir http://localhost:3000/health: debe responder `{"status":"ok"}`.

Los datos viven en memoria: al reiniciar el servidor vuelven a los datos semilla.

## Endpoints

| Verbo  | Ruta               | Descripción                    | Éxito | Errores |
|--------|--------------------|--------------------------------|-------|---------|
| GET    | `/health`          | Estado del servidor            | 200   |         |
| GET    | `/spaces`          | Listar espacios                | 200   |         |
| GET    | `/spaces/:id`      | Obtener un espacio             | 200   | 404     |
| POST   | `/spaces`          | Crear espacio                  | 201   | 400     |
| PUT    | `/spaces/:id`      | Actualizar espacio             | 200   | 400, 404 |
| DELETE | `/spaces/:id`      | Borrar espacio                 | 204   | 404     |
| GET    | `/requesters`      | Listar solicitantes            | 200   |         |
| GET    | `/requesters/:id`  | Obtener un solicitante         | 200   | 404     |
| POST   | `/requesters`      | Crear solicitante              | 201   | 400     |
| PUT    | `/requesters/:id`  | Actualizar solicitante         | 200   | 404     |
| DELETE | `/requesters/:id`  | Borrar solicitante             | 204   | 404     |

Cuerpos de ejemplo:

```json
// POST /spaces  (name y capacity son obligatorios)
{ "name": "Sala de Juntas", "capacity": 12, "location": "Bloque D", "type": "sala" }

// POST /requesters  (name y email son obligatorios)
{ "name": "Ana Martinez", "email": "ana@universidad.edu" }
```

## Pruebas con Postman

Importar `docs/postman/reservas-api.postman_collection.json`. Usa la variable `baseUrl` (`http://localhost:3000`) y cada petición trae una prueba que valida el código de estado esperado.

## Modelo de datos

Las tres entidades del dominio (espacio, solicitante y reserva) están descritas en [docs/modelo-datos.md](docs/modelo-datos.md).

## Créditos

La estructura parte del proyecto del grupo 3 de Programación V (UNIAJC), desarrollado por Erick Santiago Carmona, Daniel Imbachi y Jaider Angulo, y de la guía AcademiaAPI del curso. Esta copia se publica sin el historial original de commits.
