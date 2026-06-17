import { Router } from 'express';
import { getStudentProfile, saveStudentProfile, getStudentsAdmin } from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

router.get('/profile/:userId', requireAuth, getStudentProfile);
router.post('/profile/save', requireAuth, saveStudentProfile);
router.get('/admin/list', requireAuth, requireAdmin, getStudentsAdmin);

export default router;
