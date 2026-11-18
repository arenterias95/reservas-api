import { Request, Response } from 'express';
import * as spaceService from '../services/space.service';
import { AuthRequest } from '../middlewares/auth.middleware';

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

// Traduce los errores con nombre del Service a codigos HTTP. Cualquier otro error se reenvia.
function handleOwnerError(error: unknown, res: Response) {
  if (error instanceof Error && error.message === 'NOT_FOUND') {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  if (error instanceof Error && error.message === 'FORBIDDEN') {
    return res.status(403).json({ error: 'Solo el dueño del espacio o un ADMIN pueden modificarlo' });
  }
  throw error;
}

export function getAllSpaces(req: Request, res: Response) {
  res.status(200).json(spaceService.listSpaces());
}

// Los espacios del usuario que inicio sesion. La ruta pasa por requireAuth.
export function getMySpaces(req: AuthRequest, res: Response) {
  res.status(200).json(spaceService.listSpacesOwnedBy(req.user!.id));
}

export function getSpaceById(req: Request, res: Response) {
  const space = spaceService.findSpaceById(Number(req.params.id));
  if (!space) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(200).json(space);
}

// Recibe AuthRequest porque la ruta pasa antes por requireAuth.
export function createSpace(req: AuthRequest, res: Response) {
  // En Express 5, req.body es undefined si no llego un JSON valido.
  const { name, capacity, location, type, ownerId } = req.body ?? {};
  if (!name || !isPositiveNumber(capacity)) {
    return res
      .status(400)
      .json({ error: 'name y capacity (numero mayor que 0) son obligatorios' });
  }
  const space = spaceService.createSpace(
    {
      name,
      capacity,
      location: location ?? '',
      type: type ?? '',
      ownerId: typeof ownerId === 'number' ? ownerId : null
    },
    // El id del usuario sale de req.user (lo dejo requireAuth), nunca del body.
    req.user!
  );
  res.status(201).json(space);
}

// Solo el dueño del espacio o un ADMIN pueden editarlo.
export function updateSpace(req: AuthRequest, res: Response) {
  // Solo los campos permitidos: nunca se pasa req.body completo (asignacion masiva).
  const { name, capacity, location, type } = req.body ?? {};
  if (capacity !== undefined && !isPositiveNumber(capacity)) {
    return res.status(400).json({ error: 'capacity debe ser un numero mayor que 0' });
  }
  try {
    const space = spaceService.updateSpaceAsOwner(Number(req.params.id), req.user!, {
      name,
      capacity,
      location,
      type
    });
    res.status(200).json(space);
  } catch (error) {
    return handleOwnerError(error, res);
  }
}

// Solo el dueño del espacio o un ADMIN pueden borrarlo.
export function deleteSpace(req: AuthRequest, res: Response) {
  try {
    spaceService.deleteSpaceAsOwner(Number(req.params.id), req.user!);
    res.status(204).send();
  } catch (error) {
    return handleOwnerError(error, res);
  }
}
