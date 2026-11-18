import { Router } from 'express';
import {
  getAllSpaces,
  getMySpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace
} from '../controllers/space.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Lectura: publica.
router.get('/', getAllSpaces);
// "mios" va ANTES de "/:id"; si no, Express lo trataria como un id.
router.get('/mios', requireAuth, getMySpaces);
router.get('/:id', getSpaceById);

// Escritura: primero requireAuth (¿quien eres?), despues requireRole (¿que puedes hacer?).
// La comprobacion de dueño (PUT y DELETE) vive en el Service.
router.post('/', requireAuth, requireRole('COORDINATOR', 'ADMIN'), createSpace);
router.put('/:id', requireAuth, requireRole('COORDINATOR', 'ADMIN'), updateSpace);
router.delete('/:id', requireAuth, requireRole('COORDINATOR', 'ADMIN'), deleteSpace);

export default router;
