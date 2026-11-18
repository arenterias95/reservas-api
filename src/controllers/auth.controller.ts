import { Request, Response } from 'express';
import { getJwtSecret } from '../config/env';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export function register(req: Request, res: Response) {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email y password son obligatorios' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'password debe tener al menos 8 caracteres' });
  }
  try {
    const user = authService.register({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }
    throw error;
  }
}

export function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }
  let secret: string;
  try {
    secret = getJwtSecret();
  } catch {
    return res.status(500).json({ error: 'Falta JWT_SECRET en el archivo .env' });
  }
  const token = authService.login(String(email), String(password), secret);
  if (!token) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }
  res.status(200).json({ token });
}

// Ruta protegida por requireAuth: req.user ya existe.
export function me(req: AuthRequest, res: Response) {
  const user = authService.findUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.status(200).json(user);
}
