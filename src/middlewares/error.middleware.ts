import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

// Ruta que no existe: se convierte en un error mas, con el mismo formato.
export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  next(new AppError(404, `No existe la ruta ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

// Middleware de errores: Express lo reconoce porque tiene CUATRO parametros.
// Debe montarse al FINAL de index.ts, despues de todas las rutas.
export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  // 1. Errores esperados de nuestra API (400, 401, 403, 404, 409)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {})
      }
    });
  }

  // 2. JSON mal escrito en el body (lo lanza express.json)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'El cuerpo de la peticion no es un JSON valido' }
    });
  }

  // 3. Body demasiado grande (lo lanza express.json)
  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.too.large') {
    return res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'El cuerpo de la peticion es demasiado grande' }
    });
  }

  // 4. Inesperado: el detalle completo va al log del servidor, nunca al cliente en produccion.
  console.error(err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      ...(isDev && err instanceof Error ? { stack: err.stack } : {})
    }
  });
}
