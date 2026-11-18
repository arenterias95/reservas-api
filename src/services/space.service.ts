import { Space, spaces } from '../data/spaces';
import { AuthUser } from '../models/user.model';

let nextId = 5; // continua despues de los 4 espacios semilla

export type SpaceInput = Omit<Space, 'id'>;

export function listSpaces(): Space[] {
  return spaces;
}

export function findSpaceById(id: number): Space | undefined {
  return spaces.find((s) => s.id === id);
}

// Espacios que pertenecen al usuario que inicio sesion.
export function listSpacesOwnedBy(userId: number): Space[] {
  return spaces.filter((s) => s.ownerId === userId);
}

// Si quien crea es COORDINATOR, el espacio queda a su nombre (nunca se toma del body).
// El ADMIN puede indicar ownerId en el body.
export function createSpace(data: SpaceInput, user: AuthUser): Space {
  const ownerId = user.role === 'COORDINATOR' ? user.id : data.ownerId;
  const newSpace: Space = { ...data, id: nextId++, ownerId };
  spaces.push(newSpace);
  return newSpace;
}

// Misma logica de campos permitidos de siempre: un PUT parcial no pisa los demas.
function applyChanges(space: Space, data: Partial<Omit<SpaceInput, 'ownerId'>>): Space {
  if (data.name !== undefined) space.name = data.name;
  if (data.capacity !== undefined) space.capacity = data.capacity;
  if (data.location !== undefined) space.location = data.location;
  if (data.type !== undefined) space.type = data.type;
  return space;
}

// Autorizacion por dueño del recurso. requireRole solo mira el rol: un COORDINATOR tiene el
// rol correcto pero no debe tocar el espacio de otro. Para saber de quien es el espacio hay que
// consultar los datos, y eso es trabajo del Service.
// Primero 404 (si no existe, no tiene sentido preguntar por su dueño) y despues 403.
function getSpaceForOwner(id: number, user: AuthUser): Space {
  const space = findSpaceById(id);
  if (!space) throw new Error('NOT_FOUND');
  if (user.role !== 'ADMIN' && space.ownerId !== user.id) {
    throw new Error('FORBIDDEN'); // no es ADMIN ni el dueño del espacio
  }
  return space;
}

export function updateSpaceAsOwner(
  id: number,
  user: AuthUser,
  data: Partial<Omit<SpaceInput, 'ownerId'>>
): Space {
  return applyChanges(getSpaceForOwner(id, user), data);
}

export function deleteSpaceAsOwner(id: number, user: AuthUser): void {
  const space = getSpaceForOwner(id, user);
  spaces.splice(spaces.indexOf(space), 1);
}
