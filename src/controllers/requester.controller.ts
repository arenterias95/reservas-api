import { Request, Response } from 'express';
import * as requesterService from '../services/requester.service';

export function getAllRequesters(req: Request, res: Response) {
  res.status(200).json(requesterService.listRequesters());
}

// idParamSchema (en la ruta) ya garantizo que el id es un entero positivo.
export function getRequesterById(req: Request, res: Response) {
  res.status(200).json(requesterService.findRequesterById(Number(req.params.id)));
}

export function createRequester(req: Request, res: Response) {
  res.status(201).json(requesterService.createRequester(req.body));
}

export function updateRequester(req: Request, res: Response) {
  res.status(200).json(requesterService.updateRequester(Number(req.params.id), req.body));
}

export function deleteRequester(req: Request, res: Response) {
  requesterService.deleteRequester(Number(req.params.id));
  res.status(204).send();
}
