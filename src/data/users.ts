import { User } from '../models/user.model';
import { hashPassword } from '../utils/password';

// Cuentas semilla (contrasena de todas: Clave123*). Se guardan solo con hash.
const SEED_PASSWORD = 'Clave123*';

export const users: User[] = [
  { id: 1, name: 'Administrador', email: 'admin@reservas.edu', passwordHash: hashPassword(SEED_PASSWORD), role: 'ADMIN' },
  { id: 2, name: 'Laura Gomez', email: 'laura@reservas.edu', passwordHash: hashPassword(SEED_PASSWORD), role: 'COORDINATOR' },
  { id: 3, name: 'Williams Henao', email: 'williams@reservas.edu', passwordHash: hashPassword(SEED_PASSWORD), role: 'COORDINATOR' }
];
