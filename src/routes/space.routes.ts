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
import { validate } from '../middlewares/validate.middleware';
import { idParamSchema } from '../schemas/common.schema';
import { createSpaceSchema, updateSpaceSchema } from '../schemas/space.schema';

const router = Router();
const id = validate(idParamSchema, 'params');

// Orden de cada ruta: quien eres -> que puedes hacer -> los datos son validos -> controlador.
// La comprobacion de dueño (PUT y DELETE) vive en el Service.

// Lectura: publica.
router.get('/', getAllSpaces);
// "mios" va ANTES de "/:id"; si no, Express lo trataria como un id.
router.get('/mios', requireAuth, getMySpaces);
router.get('/:id', id, getSpaceById);

router.post('/', requireAuth, requireRole('COORDINATOR', 'ADMIN'), validate(createSpaceSchema), createSpace);
router.put('/:id', requireAuth, requireRole('COORDINATOR', 'ADMIN'), id, validate(updateSpaceSchema), updateSpace);
router.delete('/:id', requireAuth, requireRole('COORDINATOR', 'ADMIN'), id, deleteSpace);

export default router;
