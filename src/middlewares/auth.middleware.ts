import { NextFunction, Request, Response } from 'express';
import { getJwtSecret } from '../config/env';
import { AuthUser, Role } from '../models/user.model';
import { verifyToken } from '../utils/jwt';

// Request con el usuario autenticado. Lo llena requireAuth.
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Filtro 1: ¿quien eres? Exige "Authorization: Bearer <token>" valido.
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  let secret: string;
  try {
    secret = getJwtSecret();
  } catch {
    return res.status(500).json({ error: 'Falta JWT_SECRET en el archivo .env' });
  }

  const payload = verifyToken(header.slice('Bearer '.length), secret);
  if (!payload) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }

  req.user = { id: payload.id, email: payload.email, role: payload.role };
  next();
}

// Filtro 2: ¿que puedes hacer? Solo mira el rol. Va SIEMPRE despues de requireAuth.
export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta accion' });
    }
    next();
  };
}
