import { Requester, requesters } from '../data/requesters';
import { AppError } from '../errors/app-error';

let nextId = 4; // continua despues de los 3 solicitantes semilla

const noEncontrado = () => new AppError(404, 'Solicitante no encontrado', 'REQUESTER_NOT_FOUND');

// El correo es un valor unico: repetirlo da 409 DUPLICATE.
function assertEmailLibre(email: string, exceptId?: number) {
  const repetido = requesters.some(
    (r) => r.email.toLowerCase() === email.toLowerCase() && r.id !== exceptId
  );
  if (repetido) {
    throw new AppError(409, 'Ya existe un solicitante con ese correo', 'DUPLICATE');
  }
}

export function listRequesters(): Requester[] {
  return requesters;
}

export function findRequesterById(id: number): Requester {
  const requester = requesters.find((r) => r.id === id);
  if (!requester) throw noEncontrado();
  return requester;
}

export function createRequester(data: Omit<Requester, 'id'>): Requester {
  assertEmailLibre(data.email);
  const newRequester: Requester = { id: nextId++, ...data };
  requesters.push(newRequester);
  return newRequester;
}

export function updateRequester(id: number, data: Partial<Omit<Requester, 'id'>>): Requester {
  const requester = findRequesterById(id);
  if (data.email !== undefined) assertEmailLibre(data.email, id);
  if (data.name !== undefined) requester.name = data.name;
  if (data.email !== undefined) requester.email = data.email;
  return requester;
}

export function deleteRequester(id: number): void {
  const requester = findRequesterById(id);
  requesters.splice(requesters.indexOf(requester), 1);
}
