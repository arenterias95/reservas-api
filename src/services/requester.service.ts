import { Requester, requesters } from '../data/requesters';

let nextId = 4; // continua despues de los 3 solicitantes semilla

export function listRequesters(): Requester[] {
  return requesters;
}

export function findRequesterById(id: number): Requester | undefined {
  return requesters.find((r) => r.id === id);
}

export function createRequester(data: Omit<Requester, 'id'>): Requester {
  const newRequester: Requester = { id: nextId++, ...data };
  requesters.push(newRequester);
  return newRequester;
}

export function updateRequester(
  id: number,
  data: Partial<Omit<Requester, 'id'>>
): Requester | undefined {
  const requester = findRequesterById(id);
  if (!requester) return undefined;
  if (data.name !== undefined) requester.name = data.name;
  if (data.email !== undefined) requester.email = data.email;
  return requester;
}

export function deleteRequester(id: number): boolean {
  const index = requesters.findIndex((r) => r.id === id);
  if (index === -1) return false;
  requesters.splice(index, 1);
  return true;
}
