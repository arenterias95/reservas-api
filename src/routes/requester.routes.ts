import { Router } from 'express';
import {
  getAllRequesters,
  getRequesterById,
  createRequester,
  updateRequester,
  deleteRequester
} from '../controllers/requester.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { idParamSchema } from '../schemas/common.schema';
import { createRequesterSchema, updateRequesterSchema } from '../schemas/requester.schema';

const router = Router();
const id = validate(idParamSchema, 'params');

router.get('/', getAllRequesters);
router.get('/:id', id, getRequesterById);

// Los solicitantes solo los administra el ADMIN.
router.post('/', requireAuth, requireRole('ADMIN'), validate(createRequesterSchema), createRequester);
router.put('/:id', requireAuth, requireRole('ADMIN'), id, validate(updateRequesterSchema), updateRequester);
router.delete('/:id', requireAuth, requireRole('ADMIN'), id, deleteRequester);

export default router;
