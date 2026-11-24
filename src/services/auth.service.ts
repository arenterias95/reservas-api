import { users } from '../data/users';
import { AppError } from '../errors/app-error';
import { AuthUser, PublicUser, User } from '../models/user.model';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';

let nextId = 4; // continua despues de las 3 cuentas semilla

function toPublic(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest;
}

export function findUserById(id: number): PublicUser {
  const user = users.find((u) => u.id === id);
  if (!user) throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
  return toPublic(user);
}

// El registro publico SIEMPRE crea un USER: el rol nunca se toma del body.
// Si el correo ya existe lanza 409 EMAIL_TAKEN.
export function register(data: { name: string; email: string; password: string }): PublicUser {
  const email = data.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new AppError(409, 'Ya existe una cuenta con ese correo', 'EMAIL_TAKEN');
  }
  const user: User = {
    id: nextId++,
    name: data.name,
    email,
    passwordHash: hashPassword(data.password),
    role: 'USER'
  };
  users.push(user);
  return toPublic(user);
}

// Devuelve el token. Si las credenciales no coinciden lanza 401 INVALID_CREDENTIALS.
// Misma respuesta para "correo no existe" y "contrasena incorrecta": no se revela cual fallo.
export function login(email: string, password: string, secret: string): string {
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AppError(401, 'Credenciales invalidas', 'INVALID_CREDENTIALS');
  }
  const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
  return signToken(authUser, secret);
}
