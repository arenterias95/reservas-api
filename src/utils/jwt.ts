import { createHmac, timingSafeEqual } from 'node:crypto';
import { AuthUser } from '../models/user.model';

// JWT con firma HS256 hecho con el modulo crypto de Node (formato estandar:
// encabezado.payload.firma, codificado en base64url).

export interface TokenPayload extends AuthUser {
  iat: number;
  exp: number;
}

const HEADER = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function signToken(user: AuthUser, secret: string, expiresInSeconds = 2 * 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = { id: user.id, email: user.email, role: user.role, iat: now, exp: now + expiresInSeconds };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${HEADER}.${body}`;
  return `${data}.${sign(data, secret)}`;
}

// Devuelve el payload si el token es valido y no ha vencido; null en cualquier otro caso.
export function verifyToken(token: string, secret: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  if (header !== HEADER) return null;

  const expected = Buffer.from(sign(`${header}.${body}`, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
