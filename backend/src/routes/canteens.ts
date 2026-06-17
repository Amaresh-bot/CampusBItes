import { Router } from 'express';
import { getCanteensByCollege, createCanteen } from '../controllers/collegeController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/college/:collegeId', getCanteensByCollege);
router.post('/', requireAuth, createCanteen);

export default router;
