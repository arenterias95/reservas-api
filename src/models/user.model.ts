export type Role = 'ADMIN' | 'COORDINATOR' | 'USER';

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

// Lo que viaja en el token y queda en req.user: nunca incluye la contrasena.
export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

// Lo que se devuelve al cliente.
export type PublicUser = Omit<User, 'passwordHash'>;
