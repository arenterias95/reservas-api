import { Router } from 'express';
import {
  getAllRequesters,
  getRequesterById,
  createRequester,
  updateRequester,
  deleteRequester
} from '../controllers/requester.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getAllRequesters);
router.get('/:id', getRequesterById);

// Los solicitantes solo los administra el ADMIN.
router.post('/', requireAuth, requireRole('ADMIN'), createRequester);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateRequester);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteRequester);

export default router;
