import { Router } from 'express';
import {
  getAllRequesters,
  getRequesterById,
  createRequester,
  updateRequester,
  deleteRequester
} from '../controllers/requester.controller';

const router = Router();

router.get('/', getAllRequesters);
router.get('/:id', getRequesterById);
router.post('/', createRequester);
router.put('/:id', updateRequester);
router.delete('/:id', deleteRequester);

export default router;
