import { Request, Response } from 'express';
import * as requesterService from '../services/requester.service';

export function getAllRequesters(req: Request, res: Response) {
  res.status(200).json(requesterService.listRequesters());
}

export function getRequesterById(req: Request, res: Response) {
  const requester = requesterService.findRequesterById(Number(req.params.id));
  if (!requester) {
    return res.status(404).json({ error: 'Solicitante no encontrado' });
  }
  res.status(200).json(requester);
}

export function createRequester(req: Request, res: Response) {
  const { name, email } = req.body ?? {};
  if (!name || !email) {
    return res.status(400).json({ error: 'name y email son obligatorios' });
  }
  const requester = requesterService.createRequester({ name, email });
  res.status(201).json(requester);
}

export function updateRequester(req: Request, res: Response) {
  const { name, email } = req.body ?? {};
  const requester = requesterService.updateRequester(Number(req.params.id), {
    name,
    email
  });
  if (!requester) {
    return res.status(404).json({ error: 'Solicitante no encontrado' });
  }
  res.status(200).json(requester);
}

export function deleteRequester(req: Request, res: Response) {
  const deleted = requesterService.deleteRequester(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Solicitante no encontrado' });
  }
  res.status(204).send();
}
