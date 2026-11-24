import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as spaceService from '../services/space.service';

// Sin try/catch y sin if de validacion: Zod valida antes, el Service lanza AppError y
// errorMiddleware responde. Express 5 envia al middleware de errores lo que se lance aqui.

export function getAllSpaces(req: Request, res: Response) {
  res.status(200).json(spaceService.listSpaces());
}

// Los espacios del usuario que inicio sesion. La ruta pasa por requireAuth.
export function getMySpaces(req: AuthRequest, res: Response) {
  res.status(200).json(spaceService.listSpacesOwnedBy(req.user!.id));
}

export function getSpaceById(req: Request, res: Response) {
  res.status(200).json(spaceService.findSpaceById(Number(req.params.id)));
}

// Recibe AuthRequest porque la ruta pasa antes por requireAuth.
export function createSpace(req: AuthRequest, res: Response) {
  const { name, capacity, location, type, ownerId } = req.body;
  const space = spaceService.createSpace(
    { name, capacity, location: location ?? '', type: type ?? '', ownerId: ownerId ?? null },
    // El id del usuario sale de req.user (lo dejo requireAuth), nunca del body.
    req.user!
  );
  res.status(201).json(space);
}

// Solo el dueño del espacio o un ADMIN pueden editarlo.
export function updateSpace(req: AuthRequest, res: Response) {
  const space = spaceService.updateSpaceAsOwner(Number(req.params.id), req.user!, req.body);
  res.status(200).json(space);
}

// Solo el dueño del espacio o un ADMIN pueden borrarlo.
export function deleteSpace(req: AuthRequest, res: Response) {
  spaceService.deleteSpaceAsOwner(Number(req.params.id), req.user!);
  res.status(204).send();
}
