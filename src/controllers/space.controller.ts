import { Request, Response } from 'express';
import * as spaceService from '../services/space.service';

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function getAllSpaces(req: Request, res: Response) {
  res.status(200).json(spaceService.listSpaces());
}

export function getSpaceById(req: Request, res: Response) {
  const space = spaceService.findSpaceById(Number(req.params.id));
  if (!space) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(200).json(space);
}

export function createSpace(req: Request, res: Response) {
  // En Express 5, req.body es undefined si no llego un JSON valido.
  const { name, capacity, location, type } = req.body ?? {};
  if (!name || !isPositiveNumber(capacity)) {
    return res
      .status(400)
      .json({ error: 'name y capacity (numero mayor que 0) son obligatorios' });
  }
  const space = spaceService.createSpace({
    name,
    capacity,
    location: location ?? '',
    type: type ?? ''
  });
  res.status(201).json(space);
}

export function updateSpace(req: Request, res: Response) {
  // Solo los campos permitidos: nunca se pasa req.body completo (asignacion masiva).
  const { name, capacity, location, type } = req.body ?? {};
  if (capacity !== undefined && !isPositiveNumber(capacity)) {
    return res.status(400).json({ error: 'capacity debe ser un numero mayor que 0' });
  }
  const space = spaceService.updateSpace(Number(req.params.id), {
    name,
    capacity,
    location,
    type
  });
  if (!space) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(200).json(space);
}

export function deleteSpace(req: Request, res: Response) {
  const deleted = spaceService.deleteSpace(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Espacio no encontrado' });
  }
  res.status(204).send();
}
