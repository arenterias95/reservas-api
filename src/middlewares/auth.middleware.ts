import { NextFunction, Request, Response } from 'express';
import { getJwtSecret } from '../config/env';
import { AppError } from '../errors/app-error';
import { AuthUser, Role } from '../models/user.model';
import { verifyToken } from '../utils/jwt';

// Request con el usuario autenticado. Lo llena requireAuth.
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Filtro 1: ¿quien eres? Exige "Authorization: Bearer <token>" valido.
// No responde por su cuenta: le pasa el error al middleware de errores con next(...).
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token no proporcionado', 'TOKEN_MISSING'));
  }

  // Si falta JWT_SECRET, getJwtSecret lanza un Error comun: es un fallo del servidor (500).
  const secret = getJwtSecret();

  const payload = verifyToken(header.slice('Bearer '.length), secret);
  if (!payload) {
    return next(new AppError(401, 'Token invalido o expirado', 'TOKEN_INVALID'));
  }

  req.user = { id: payload.id, email: payload.email, role: payload.role };
  next();
}

// Filtro 2: ¿que puedes hacer? Solo mira el rol. Va SIEMPRE despues de requireAuth.
export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'No tienes permiso para realizar esta accion', 'FORBIDDEN_ROLE'));
    }
    next();
  };
}
