import './config/env'; // primera linea: carga .env antes de leer JWT_SECRET
import express from 'express';
import authRoutes from './routes/auth.routes';
import spaceRoutes from './routes/space.routes';
import requesterRoutes from './routes/requester.routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

const app = express();

// El parser de JSON siempre va antes de las rutas.
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/spaces', spaceRoutes);
app.use('/requesters', requesterRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'El servidor esta funcionando correctamente'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

app.get('/alumnos', (req, res) => {
  res.status(200).json([
    { id: 1, nombre: 'Juan', apellido: 'Perez', edad: 20 },
    { id: 2, nombre: 'Maria', apellido: 'Gomez', edad: 22 },
    { id: 3, nombre: 'Pedro', apellido: 'Lopez', edad: 21 }
  ]);
});

// Siempre al FINAL, despues de todas las rutas: primero la ruta inexistente (404) y luego
// el middleware de errores (cuatro parametros).
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});