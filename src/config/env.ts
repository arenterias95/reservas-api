import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Carga el archivo .env (si existe) usando Node, sin librerias extra.
// Debe importarse en la primera linea de src/index.ts.
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET_MISSING');
  }
  return secret;
}
