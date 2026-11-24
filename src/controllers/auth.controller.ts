import { Request, Response } from 'express';
import { getJwtSecret } from '../config/env';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as authService from '../services/auth.service';

// Los datos ya llegan validados por Zod (validate) y los errores los maneja errorMiddleware:
// el controlador no tiene try/catch ni if de validacion.

export function register(req: Request, res: Response) {
  const user = authService.register(req.body);
  res.status(201).json(user);
}

export function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const token = authService.login(email, password, getJwtSecret());
  res.status(200).json({ token });
}

// Ruta protegida por requireAuth: req.user ya existe.
export function me(req: AuthRequest, res: Response) {
  res.status(200).json(authService.findUserById(req.user!.id));
}
