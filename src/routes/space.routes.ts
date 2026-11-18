import { Router } from 'express';
import {
  getAllSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace
} from '../controllers/space.controller';

const router = Router();

router.get('/', getAllSpaces);
router.get('/:id', getSpaceById);
router.post('/', createSpace);
router.put('/:id', updateSpace);
router.delete('/:id', deleteSpace);

export default router;
