import { users } from '../data/users';
import { AuthUser, PublicUser, User } from '../models/user.model';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';

let nextId = 4; // continua despues de las 3 cuentas semilla

function toPublic(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest;
}

export function findUserById(id: number): PublicUser | undefined {
  const user = users.find((u) => u.id === id);
  return user ? toPublic(user) : undefined;
}

// El registro publico SIEMPRE crea un USER: el rol nunca se toma del body.
// Lanza EMAIL_TAKEN si el correo ya existe.
export function register(data: { name: string; email: string; password: string }): PublicUser {
  const email = data.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error('EMAIL_TAKEN');
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

// Devuelve el token, o null si las credenciales no coinciden.
// Misma respuesta para "correo no existe" y "contrasena incorrecta": no se revela cual fallo.
export function login(email: string, password: string, secret: string): string | null {
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
  return signToken(authUser, secret);
}
