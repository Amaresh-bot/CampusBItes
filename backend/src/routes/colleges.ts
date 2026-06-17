import { Router } from 'express';
import { getColleges, createCollege } from '../controllers/collegeController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getColleges);
router.post('/', requireAuth, createCollege);

export default router;
